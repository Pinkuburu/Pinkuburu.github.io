---
layout: post
title: "Linux操作命令学习和备忘"
subtitle: "工作中常用的Linux维护命令"
date: 2020-06-08 19:19:53
author: "邱陈程"
header-img: "img/post-bg-css.jpg"
tags:
- Linux
- bash
- 程序
---
## 日常常用命令

- g++编译器
```bash
$ sudo apt install g++
```

- 安装git
```bash
$ sudo apt install git
```
- 切换到root
```bash
$ sudo -i
```
- nginx安装
```bash
$ sudo apt-get install nginx
```
- 查看本机网络信息
```bash
$ ifconfig -a
```
- 创建文件
```bash
$ touch xxxxxxxxxx.yml
```
- 编辑文件
```bash
$ vi xxxxxxxx.yml
```
- vim删除整行，直接按dd
- vim保存退出
```bash
:wq
```
- 把文件夹和里面的内容，完整copy到目标地址
```bash
$ cp -r testfolder testfolder_backup
```

- 删除文件夹，将会删除/var/log/httpd/access目录以及其下所有文件、文件夹
```bash
rm -rf /var/log/httpd/access
```

- zip压缩 【参数】 【打包后的文件名】 【打包的目录路径】

  `-a` 将文件转成ASCII模式
  `-F` 尝试修复损坏的压缩文件
  `-h` 显示帮助界面
  `-m` 将文件压缩之后，删除源文件
  `-n` 特定字符串 不压缩具有特定字尾字符串的文件
  `-o` 将压缩文件内的所有文件的最新变动时间设为压缩时候的时间
  `-q` 安静模式，在压缩的时候不显示指令的执行过程
  `-r` 将指定的目录下的所有子目录以及文件一起处理
  `-S` 包含系统文件和隐含文件（S是大写）
```bash
$ zip -r test.zip tmb/
```
- unzip

  `-n` 解压缩时不要覆盖原有的文件；
  `-o` 不必先询问用户，unzip执行后覆盖原有的文件；
  `-P [密码]` 使用zip的密码选项；
  `-q` 执行时不显示任何信息；
  `-d [目录]` 指定文件解压缩后所要存储的目录；
```bash
$ unzip test.zip
```
- 将压缩文件test.zip在指定目录/tmp下解压缩，如果已有相同的文件存在，要求unzip命令覆盖原先的文件。
```bash
$ unzip -o test.zip -d tmp/
```

- 修改Ubuntu的apt源
```bash
#切换到root
$ sudo -i
#备份原文件
$ cp /etc/apt/sources.list /etc/apt/sources.list.backup
#编辑文件
$ sudo vim /etc/apt/sources.list
```
再写入如下的aliyun源

```bash
deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
```

- Ubuntu桌面版开启SSH服务

```bash
#安装服务
$ sudo apt install openssh-server
#安装完成，服务默认已经开启，可以远程ssh连接了。

#查看ssh服务状态：
$ sudo service ssh status

#ssh服务重启命令：
$ sudo service ssh restart

#ssh服务的配置文件，可以修改服务端口，权限控制等
$ sudo gedit /etc/ssh/sshd_config
```

- 查看端口占用情况

```bash
sudo netstat -lnp | grep 80
```

​    