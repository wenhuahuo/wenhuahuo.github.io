---
title: 使用Rotated MNIST理解Mixture of Experts中的合作与竞争损失
date: 2026-05-09 00:00:00
tags: [Deep Learning, Mixture of Experts, PyTorch]
categories: 深度学习
---

# 前言

最近阅读了 Jacobs、Jordan、Nowlan 和 Hinton 在 1991 年发表的论文 *Adaptive Mixtures of Local Experts*。这篇论文讨论了一个很有启发性的想法：如果一个任务天然可以分解成多个子任务，那么与其训练一个单一网络处理所有样本，不如训练多个 local experts，再由一个 gating network 决定每个样本应该交给哪些 expert。

这篇论文让我感兴趣的地方不只是 MOE 的结构，而是它比较了几种不同的训练目标。不同损失函数会改变 experts 之间的关系：有的损失鼓励多个 expert 合作完成预测，有的损失鼓励 expert 之间竞争，让 gating network 对每个样本做更明确的分配。

为了对这个机制形成直观理解，我设计了一个小规模实验：使用 `torchvision.datasets.MNIST` 构造 Rotated MNIST 角度回归任务，并比较论文中提到的三类 MOE 损失。实验目标不是在 MNIST 上追求最优性能，而是观察三种损失是否真的会导致不同的专家协作和竞争行为。

# 方法背景

MOE 系统由多个 expert network 和一个 gating network 组成。对第 `c` 个样本，记输入为 `x^c`，目标为 `d^c`，第 `i` 个 expert 的输出为 `o_i^c`，gating network 给出的权重为 `p_i^c`。gating 权重通过 softmax 归一化：

$$
\sum_i p_i^c = 1, \quad p_i^c \ge 0
$$

最终输出通常写成：

$$
\hat d^c = \sum_i p_i^c o_i^c
$$

论文中值得比较的是以下三种损失。

## 合作式混合输出损失

第一种损失先混合所有 expert 的输出，再和目标比较：

$$
E^c = \left\|d^c - \sum_i p_i^c o_i^c\right\|^2
$$

这个损失鼓励的是合作。每个 expert 不需要独立完成完整预测，只要多个 expert 的加权和接近目标即可。因此它可能在预测误差上表现很好，但不一定能学出清晰的专家分工。

## 期望平方误差损失

第二种损失要求每个 expert 独立预测完整目标，再用 gating 权重加权每个 expert 的误差：

$$
E^c = \sum_i p_i^c \left\|d^c - o_i^c\right\|^2
$$

这比第一种损失更有竞争意味，因为 expert 不能只拟合其他 expert 留下的残差。不过，每个 expert 的梯度仍主要受 `p_i^c` 缩放，所以竞争信号相对温和。

## 负对数混合似然损失

第三种损失是论文实际更推荐的形式，对应高斯混合模型的负对数似然：

$$
E^c = -\log \sum_i p_i^c \exp\left(-\frac{1}{2}\left\|d^c-o_i^c\right\|^2\right)
$$

这个损失不仅考虑 gate 给出的先验权重，也考虑 expert 对当前样本的相对拟合质量。如果某个 expert 已经比其他 expert 更接近目标，它会通过指数项获得更高责任，从而得到更强的更新信号。论文认为，这种机制更容易形成“表现好的 expert 继续负责相似样本”的局部分工。

# 实验任务设计

我没有直接做 MNIST 分类，而是把 MNIST 改造成一个图像回归任务：输入为旋转后的数字图像，输出为旋转角度。

为了避免角度周期性问题，目标不是直接预测角度 `theta`，而是预测：

$$
d = [\sin\theta, \cos\theta]
$$

为了让数据中存在潜在子任务，我按数字类别设置不同的旋转角度范围，但训练时不把组标签告诉模型。

| 潜在组 | 数字 | 旋转角度范围 |
|---|---|---:|
| 负角度组 | `0-2` | `[-70°, -25°]` |
| 近零角度组 | `3-5` | `[-20°, 20°]` |
| 正角度组 | `6-9` | `[25°, 70°]` |

这个任务的好处是数据集很小、训练很快，而且输出是连续变量，可以直接使用论文中的平方误差型损失。它的缺点也很明显：Rotated MNIST 是高维视觉任务，不像论文中的二维元音识别任务那样天然适合局部线性 expert。因此，这个实验更适合作为理解 MOE 行为的快速实验，而不是严格复现论文结果。

# 评价指标

实验主要看四个指标。

| 指标 | 含义 |
|---|---|
| Test MSE | 最终加权输出 `hat d` 与目标 `[sin(theta), cos(theta)]` 的均方误差 |
| Angle MAE | 由输出向量恢复角度后的平均绝对角度误差，单位为度 |
| Gate Entropy | gating 分布的平均熵，越低表示越接近硬选择 |
| Expert Usage | 每个 expert 成为最大 gating 权重 expert 的比例 |

其中 gating entropy 定义为：

$$
H(p^c) = -\sum_i p_i^c \log p_i^c
$$

本实验使用 4 个 experts，因此最大 entropy 为：

$$
\log 4 \approx 1.386
$$

如果 entropy 接近 0，说明 gate 基本只选择一个 expert；如果 entropy 接近 1.386，说明 gate 更接近均匀混合。

# 第一轮实验：三种损失的直接比较

第一轮实验采用 4 个线性 experts 和一个 MLP gating network。使用线性 expert 是有意为之：如果 expert 容量过强，单个 expert 很容易吸收整个任务，MOE 的分工现象反而不容易观察。

实验设置如下：

| 项目 | 设置 |
|---|---|
| 数据集 | `torchvision.datasets.MNIST` |
| 任务 | Rotated MNIST 角度回归 |
| expert 数量 | 4 |
| expert 结构 | 线性层 |
| gating network | MLP |
| 训练样本数 | 12000 |
| 测试样本数 | 2000 |
| 训练轮数 | 8 |
| batch size | 256 |
| 优化器 | Adam |
| 学习率 | `0.001` |
| 随机种子 | `7` |

结果如下：

| 损失函数 | Test MSE | Angle MAE | Gate Entropy | Expert Usage |
|---|---:|---:|---:|---|
| `cooperative_mse` | 0.0583 | 9.19° | 0.955 | E0: 98.9%, E1: 0.2%, E2: 0.9%, E3: 0.1% |
| `expected_mse` | 0.1100 | 11.37° | 0.040 | E0: 85.0%, E1: 0.0%, E2: 15.0%, E3: 0.0% |
| `mixture_nll` | 0.1083 | 11.25° | 0.056 | E0: 81.3%, E1: 0.0%, E2: 18.6%, E3: 0.0% |

这个结果很有意思。`cooperative_mse` 的预测误差最低，但 gate entropy 最高，说明它更倾向于保留混合输出。相反，`expected_mse` 和 `mixture_nll` 的 gate entropy 非常低，说明它们确实推动 gating network 做近似硬选择，但预测误差反而更高。

换句话说，两个竞争式损失确实实现了论文所说的竞争机制，但在这个任务上，硬选择没有转化为更好的预测性能。

# 为什么竞争式损失没有更好？

第一轮实验后，一个自然问题是：竞争式损失效果不如合作式损失，是因为数据量太小，还是因为任务和模型不适配？为此我做了三个扩展消融实验。

## A：数据量消融

我固定 expert 为线性层，固定随机种子为 `7`，将训练样本数从 `12000` 增加到 `30000`。

| 训练样本数 | 损失函数 | Test MSE | Angle MAE | Gate Entropy |
|---:|---|---:|---:|---:|
| 12000 | `cooperative_mse` | 0.0699 | 10.15° | 0.965 |
| 12000 | `expected_mse` | 0.1189 | 11.25° | 0.058 |
| 12000 | `mixture_nll` | 0.1181 | 11.20° | 0.071 |
| 30000 | `cooperative_mse` | 0.0494 | 8.55° | 0.942 |
| 30000 | `expected_mse` | 0.0983 | 11.01° | 0.047 |
| 30000 | `mixture_nll` | 0.0974 | 10.94° | 0.045 |

增加数据量后，三种损失都有改善，但改善幅度不同。`cooperative_mse` 的 Angle MAE 从 `10.15°` 降到 `8.55°`，改善 `1.60°`；`expected_mse` 只改善 `0.24°`；`mixture_nll` 只改善 `0.26°`。

这说明，数据量不是主要瓶颈。即使增加训练数据，竞争式损失仍然明显落后于合作式损失，而且 gate entropy 依然很低。

## B：Expert 容量消融

我固定训练样本数为 `12000`，固定随机种子为 `7`，将 expert 从线性层改为带一个隐藏层的 `MLP-32`。

| Expert 容量 | 损失函数 | Test MSE | Angle MAE | Gate Entropy |
|---|---|---:|---:|---:|
| 线性 | `cooperative_mse` | 0.0699 | 10.15° | 0.965 |
| 线性 | `expected_mse` | 0.1189 | 11.25° | 0.058 |
| 线性 | `mixture_nll` | 0.1181 | 11.20° | 0.071 |
| MLP-32 | `cooperative_mse` | 0.0534 | 9.25° | 0.804 |
| MLP-32 | `expected_mse` | 0.0862 | 10.28° | 0.013 |
| MLP-32 | `mixture_nll` | 0.0846 | 10.05° | 0.015 |

提高 expert 容量后，竞争式损失明显改善。`expected_mse` 的 Angle MAE 从 `11.25°` 降到 `10.28°`，`mixture_nll` 从 `11.20°` 降到 `10.05°`。这比单纯增加数据量带来的改善更明显。

这说明，竞争式损失表现不佳的重要原因是：硬选择之后，每个样本主要由单个 expert 负责，而线性 expert 对 Rotated MNIST 这种高维视觉回归任务来说太弱。

不过，即使使用 `MLP-32`，`cooperative_mse` 仍然最好，Angle MAE 为 `9.25°`。这说明当前任务仍然从混合输出中获益。

另一个值得注意的现象是，`MLP-32` 下竞争式损失的 gate entropy 进一步降低到接近 0，但 Expert Usage 显示几乎所有样本都被路由到单个 expert。这说明提高容量虽然改善了误差，却也加重了 expert collapse：模型更容易让一个较强 expert 吸收全部任务。

## E：多随机种子稳定性

最后我在随机种子 `7/11/19` 下重复训练，观察结论是否稳定。

| Expert 容量 | 损失函数 | seed 数 | Test MSE | Angle MAE | Gate Entropy |
|---|---|---:|---:|---:|---:|
| 线性 | `cooperative_mse` | 3 | 0.0715 ± 0.0019 | 10.39 ± 0.23° | 0.984 ± 0.020 |
| 线性 | `expected_mse` | 3 | 0.1209 ± 0.0029 | 11.60 ± 0.33° | 0.078 ± 0.017 |
| 线性 | `mixture_nll` | 3 | 0.1196 ± 0.0027 | 11.52 ± 0.32° | 0.088 ± 0.015 |
| MLP-32 | `cooperative_mse` | 3 | 0.0576 ± 0.0039 | 9.56 ± 0.27° | 0.798 ± 0.006 |
| MLP-32 | `expected_mse` | 3 | 0.0854 ± 0.0096 | 10.35 ± 0.17° | 0.014 ± 0.009 |
| MLP-32 | `mixture_nll` | 3 | 0.0853 ± 0.0093 | 10.27 ± 0.22° | 0.017 ± 0.009 |

多 seed 结果说明，主要现象不是单次初始化的偶然结果。随机种子会改变具体哪个 expert 被选中，但不会改变总体趋势：`cooperative_mse` 预测更好，两个竞争式损失 gate 更硬。

# 综合理解

这些实验让我对 MOE 有了几个初步理解。

首先，MOE 的损失函数不仅影响误差大小，也会显著改变模型组织方式。`cooperative_mse` 更像一个加权 ensemble，它直接优化加权平均输出，因此预测误差较低，但 expert 分工并不一定清晰。`expected_mse` 和 `mixture_nll` 则更像在训练一个会自己分配样本的模块化系统，它们确实能让 gate 变得很尖锐。

其次，竞争不等于性能更好。竞争式损失让模型做硬路由后，每个样本主要由单个 expert 负责。如果单个 expert 对当前子任务来说太弱，硬选择反而会损失多个 expert 混合输出带来的表达能力。

第三，任务结构很重要。论文原始实验是低维元音识别，局部线性 expert 很容易解释，也容易形成清楚的任务分解。Rotated MNIST 是高维图像任务，即便人为设置了角度组，输入空间中的分工结构也不如二维任务直观。因此，这个任务能帮助理解 MOE 的训练行为，但并不一定能展示竞争式 MOE 的最好效果。

第四，expert collapse 是实际训练中的重要问题。在多组实验中，竞争式损失虽然让 gate 变硬，但并没有充分使用所有 expert。尤其在提高 expert 容量后，一个 expert 更容易吸收全部任务。这说明实际 MOE 训练往往还需要负载均衡、温度退火或其他防 collapse 机制。

# 结论

这组实验没有证明 `mixture_nll` 在 Rotated MNIST 上优于其他损失，但它验证了论文中的一个关键思想：不同损失会诱导不同的 expert 交互方式。

在当前设置下，结论可以概括为：

- `cooperative_mse` 预测误差最好，但更偏向合作和混合输出。
- `expected_mse` 和 `mixture_nll` 成功推动 gate 硬选择，更符合竞争式 MOE 的思想。
- 竞争式损失效果不佳的主要原因不是数据量太小，而是 Rotated MNIST 任务和当前 expert 设置下，硬选择带来的表达能力损失较大。
- 提高 expert 容量能改善竞争式损失，但也可能加重 expert collapse。
- 要更公平地展示竞争式 MOE 的优势，需要更适合局部专家分解的任务，或者加入负载均衡、温度退火等训练策略。

对我来说，这个实验最大的价值是区分了两个容易混淆的问题：MOE 是否形成了专家竞争，以及这种竞争是否提升了预测性能。前者在实验中已经比较清楚地出现了；后者则依赖任务结构、expert 容量和训练策略，并不是损失函数本身能单独保证的。

# 复现信息

实验在本地 conda 环境 `torch240` 中运行，使用 PyTorch 和 torchvision。核心实验脚本包括：

- `rotated_mnist_moe_losses.py`：三种损失的基础比较。
- `rotated_mnist_moe_extra_experiment.py`：数据量、expert 容量和多随机种子消融。

基础实验命令：

```bash
conda run -n torch240 python rotated_mnist_moe_losses.py --epochs 8 --train-size 12000 --test-size 2000
```

扩展实验命令：

```bash
conda run -n torch240 python rotated_mnist_moe_extra_experiment.py
```

# 参考

Jacobs, R. A., Jordan, M. I., Nowlan, S. J., & Hinton, G. E. (1991). Adaptive mixtures of local experts. *Neural Computation*, 3(1), 79-87.
