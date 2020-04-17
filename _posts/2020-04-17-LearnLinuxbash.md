---
layout: post
title: "Linux操作命令学习和备忘"
subtitle: "工作中常用的Linux维护命令"
date: 2020-04-17 19:19:53
author: "邱陈程"
header-img: "img/title/post-bg-css.jpg"
tags:
- Linux
- bash
- 程序
---


- g++编译器


sudo apt install g++

- //git组件


sudo apt install git

- 切换到root

sudo -i

- nginx安装

sudo apt-get install nginx

- 查看本机网络信息

ifconfig -a

- 创建配置文件

touch xxxxxxxxxx.yml

- 编辑配置文件

vi xxxxxxxx.yml

- vim保存退出

:wq

- docker安装

```bash
$ sudo apt-get update

$ sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl 	\
    gnupg-agent \
    software-properties-common

$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

$ sudo apt-key fingerprint 0EBFCD88
#理论会返回类似如下内容，可能会有细节差异
#pub   rsa4096 2017-02-22 [SCEA]
#      9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
#uid           [ unknown] Docker Release (CE deb) <docker@docker.com>
#sub   rsa4096 2017-02-22 [S]

$ sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
   
$ sudo apt-get update

$ sudo apt-get install docker-ce docker-ce-cli containerd.io
#似乎打完这条命令就已经可以通过docker -v查看到版本了

#如果你要选择版本打这个命令
$ apt-cache madison docker-ce
#打完命令就会让你选择版本
  docker-ce | 5:18.09.1~3-0~ubuntu-xenial | https://download.docker.com/linux/ubuntu  xenial/stable amd64 Packages
  docker-ce | 5:18.09.0~3-0~ubuntu-xenial | https://download.docker.com/linux/ubuntu  xenial/stable amd64 Packages
  docker-ce | 18.06.1~ce~3-0~ubuntu       | https://download.docker.com/linux/ubuntu  xenial/stable amd64 Packages
  docker-ce | 18.06.0~ce~3-0~ubuntu       | https://download.docker.com/linux/ubuntu  xenial/stable amd64 Packages
  ...

```

- 安装docker compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose
#测试安装信息，有信息就是成功
docker-compose --version
```

- 每次修改完配置都需要重启

docker-compose down && docker-compose up -d

- 把文件夹和里面的内容，完整copy到目标地址

cp -r weblate weblate_backup

- 删除文件夹，将会删除/var/log/httpd/access目录以及其下所有文件、文件夹

rm -rf /var/log/httpd/access

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

zip -r test.zip tmb/

- unzip

`-n` 解压缩时不要覆盖原有的文件；

`-o` 不必先询问用户，unzip执行后覆盖原有的文件；

`-P [密码]` 使用zip的密码选项；

`-q` 执行时不显示任何信息；

`-d [目录]` 指定文件解压缩后所要存储的目录；

unzip test.zip

- 将压缩文件test.zip在指定目录/tmp下解压缩，如果已有相同的文件存在，要求unzip命令覆盖原先的文件。

unzip -o test.zip -d tmp/



