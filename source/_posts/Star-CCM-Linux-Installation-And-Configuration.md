---
title: Linux下多版本Star-CCM+安装与许可装环境变量配置
date: 2025-11-27 12:55:59
tags: [StarCCM, CFD]
categories: 系统及软件配置
---

# 前言
在Linux系统中安装Star-CCM+后，为了正常使用，需要手动配置许可证环境变量；在配置多版本许可证环境变量时，遇到了许可证环境变量缓存问题：在`~/.bashrc`中指定一个`CDLMD_LICENSE_FILE`环境变量后，将此变量称为`var1`，运行软件，软件会读取`var1`的路径，但是在更改环境变量路径为`var2`后，启动Star-CCM+软件，仍会读取`var1`的路径，并且这一情况在不同版本的Star-CCM+中都会出现。这篇博客会介绍STAR-CCM+软件的安装以及该问题的解决。

# 软件安装
## 安装文件下载
软件安装磁力链接见[链接1](https://x.com/TeAMSolidSQUAD)或[链接2](https://www.sotwe.com/teamsolidsquad)，博客以`Siemens Star-CCM+ 2506.0001 (20.04.008 single precision) Linux64`版本为例，下载后的文件应为以下结构
```
Siemens.STAR-CCM+2506.0001_20.04.008.Single.Precision.Linux64-SSQ
├─ Simcenter_STAR-CCM+_2506.0001-Linux-x64-mixed.tar.gz
└─ _SolidSQUAD_
   ├─ 20.04.008-ssq.tar.xz
   ├─ license.dat
   └─ readme_linux.txt
```

## 安装步骤
1. 使用`tar`命令解压`Simcenter_STAR-CCM+_2506.0001-Linux-x64-mixed.tar.gz`文件，命令如下：
``` bash
tar -zxvf Simcenter_STAR-CCM+_2506.0001-Linux-x64-mixed.tar.gz
```

2. 进入解压出的文件夹，可以看到安装所需的可执行文件，运行可执行文件，并指定不安装许可证服务器
``` bash
/STAR-CCM+2506_008_linux-x86_64-2.28_clang17.0.aol -DINSTALL_LICENSING=false
```

软件会默认安装到`/opt/Siemens`路径下，如果需要修改，则下一步中使用的安装路径也需一并修改。

3. 下一步进行许可证的配置，
在配置许可证前，需要前往`_SolidSQUAD_`文件夹，解压`20.04.008-ssq.tar.xz`，得到`20.04.008`目录，该目录与安装路径下的目录是同名的，需要使用此文件夹覆盖安装路径下的文件夹，这一步需要执行的命令有：
``` bash
tar -zxvf 20.04.008-ssq.tar.xz
```
``` bash
cp -r 20.04.008 /opt/Siemens/
```

接着可以进行环境变量的配置，笔者建议将许可证文件存放到安装路径，便于配置与管理，并设置环境变量将许可证路径指向该许可证。
``` bash
cp license.dat /opt/Siemens
```
``` bash
vim ~/.bashrc
```
在vim中，将`CDLMD_LICENSE_FILE=/opt/Siemens/license.dat`写入，
接着使环境变量生效：
``` bash
source ~/.bashrc
```

4. 软件启动别名设置
正确配置许可证后，可以执行软件的启动脚本运行StarCCM+，此时的运行命令如下：
``` bash
/opt/Siemens/20.04.008/STAR-CCM+20.04.008/star/bin/starccm+
```
为了便于此后通过终端启动软件，可以设置指令别名，即在`~/.bashrc`中写入：
``` bash
alias starccm+=/opt/Siemens/20.04.008/STAR-CCM+20.04.008/star/bin/starccm+
```
环境变量生效后，便可以通过运行`starccm+`指令启动软件了。

## 许可证环境变量缓存问题
在StarCCM+运行时，会读取`~/.bashrc`中的许可证变量写入`~/.flexlmrc`，并且在`~/.bashrc`中的许可证路径改变时，会追加到`~/.flexlmrc`中，当存在多个许可证路径时，StarCCM+在启动时会自动选择合适的许可证。因此如果错误配置了多次环境变量导致软件启动时重复读取，可以直接修改或删除`~/.flexlmrc`文件。

但事实上笔者在Ubuntu24.04上安装了StarCCM+2506、2410、2206，简单的测试发现高版本软件的许可证可以兼容低版本的软件，因此理论上只需要设置一个最新的许可证环境变量就可以支持多版本StarCCM+的使用了。

> 存疑：如果StarCCM+会读取`~/.flexlmrc`中的环境变量，那么理论上直接修改`~/.flexlmrc`即可，但是笔者没有测试不设置`~/.bashrc`环境变量软件能否启动，等有机会再安装时测试一下。

# 小结
博客提供了Linux环境下StarCCM+软件的相关链接，安装方法以及许可证缓存问题的解决方案。

# 参考
[https://support.sdasoftware.com/portal/en/kb/articles/star-ccm-license-server-troubleshooting-guide#Troubleshooting_Steps](https://support.sdasoftware.com/portal/en/kb/articles/star-ccm-license-server-troubleshooting-guide#Troubleshooting_Steps)