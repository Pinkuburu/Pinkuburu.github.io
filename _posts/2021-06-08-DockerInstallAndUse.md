---
layout: post
title: "在Ubuntu上安装和使用Docker"
subtitle: "适合新手一站式入门并了解docker的安装使用，基于工作经验和需求整理归纳的命令"
date: 2021-06-08 16:22:30
author: "邱陈程"
header-img: "img/post-bg-css.jpg"
tags:
- Linux
- bash
- Docker
- 运维
- 程序
---

- docker安装的步骤，按顺序敲命令即可，复制命令无需带上$符号

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

#补充和其他：
#如果你要选择版本打这个命令
$ apt-cache madison docker-ce
#打完命令就会让你选择版本
  docker-ce | 5:18.09.1~3-0~ubuntu-xenial | https://download.docker.com/linux/ubuntu  xenial/stable amd64 Packages
  docker-ce | 5:18.09.0~3-0~ubuntu-xenial | https://download.docker.com/linux/ubuntu  xenial/stable amd64 Packages
  docker-ce | 18.06.1~ce~3-0~ubuntu       | https://download.docker.com/linux/ubuntu  xenial/stable amd64 Packages
  docker-ce | 18.06.0~ce~3-0~ubuntu       | https://download.docker.com/linux/ubuntu  xenial/stable amd64 Packages
  ...
```

- 为了方便使用，还需要安装docker compose

```bash
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

$ sudo chmod +x /usr/local/bin/docker-compose

#测试安装信息，有信息就是成功
$ docker-compose --version
```

- 每次修改完docker-compose的配置都需要重启，在放置docker-compose的目录中运行如下命令

```bash
#命令代表第一步先停止容器，第二步后台启动容器，如果需要看启动的输出信息，把-d去掉即可
$ docker-compose down && docker-compose up -d
```

- 为了减少使用docker命令时减少打sudo的频率，需要做如下操作

```bash
#添加docker用户组
$ sudo groupadd docker  

#将登陆用户加入到docker用户组中
#$ sudo gpasswd -a $USER docker 其实这句我不知道有没有效
$ sudo usermod -aG docker $USER

#更新用户组，其实这步要不要我也不清楚，我无脑从网上复制过来的
$ newgrp docker

#测试docker命令是否可以使用sudo正常使用
$ docker ps 
```
-  运行docker镜像引发报错：“ERROR: Couldn't connect to Docker daemon at http docker://localhost ……”

```bash
#启动docker服务
$ service docker start
#生成自启动服务
$ systemctl enable docker.service
#查看服务状态，Active状态为：active（running）
$ systemctl status docker.service

#如果以上操作并无法解决，再试试如下命令
## 1 docker服务没启动，那就启动
$ sudo systemctl start docker     // 或者 sudo service docker start
$ docker-compose up

## 2 docker服务启动了，但是一些缓存影响了,那就重启
$ sudo systemctl restart docker   // 或者 sudo service docker restart
$ docker-compose up

## 3 当前用户不在`docker`用户组,那就把自己加到`docker`用户组,添加到`docker`用户组后要重新登录shell再`up`。
$ sudo gpasswd -a ${USER} docker
$ docker-compose up

## 4 也许用sudo可能有效
$ sudo docker-compose up

## 5 docker-compose版本太老了,那就更新版本
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.23.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
$ docker-compose up
#复制链接查看[docker-compose官方安装教程](https://docs.docker.com/compose/install/#install-compose)（可能需要梯子）。

## 6 重启系统吧
$ sudo reboot
$ docker-compose up
```

- 在本地Linux登录docker：

```bash
$ docker login 
```
- 推送镜像的规范是：

```bash
$ docker push 注册用户名/镜像名:标签名
```
- tag命令修改为规范的镜像：

```bash
$ docker tag boonya/tomcat-allow-remote boonyadocker/tomcat-allow-remote 
```
- 通过push命令推送镜像：

```bash
$ docker push boonyadocker/tomcat-allow-remote:latest 
```