---
layout: post
title: "使用C#开发远程执行Linux服务器上的Shell"
subtitle: "使用C#开发的工具，对远程的Linux服务器执行Shell命令"
date: 2020-05-09 15:34:53
author: "邱陈程"
header-img: "img/post-bg-css.jpg"
tags:
- Linux
- bash
- 程序
- C#
---

工作的流程工具上有一个环节使用了docker，部署在一台Ubuntu的服务器上，偶尔需要去docker里去执行一些命令。虽然频率不高，但本着懒得精神，想做个工具，省下打开SSH工具，敲打命令的过程。
由于我只会一些皮毛的C#，所以我一开始瞄准的路径就是如何用C#开发工具，对Ubuntu服务器传递执行Shell命令。

## 实现C#操作Linux服务器

在Github上找到了这样一个工程，网址：https://github.com/sshnet/SSH.NET，我们在工程里使用NuGet引用一下。

实现代码

```c#
public static string linuxSSHShell(string cmdString)
{
    string msg = string.Empty;
    Renci.SshNet.SshClient ssh = new Renci.SshNet.SshClient("IP地址", "用户名", "密码");
    ssh.Connect();
    var line = cmdString;
    var cmd = ssh.RunCommand(line);
    if (!string.IsNullOrWhiteSpace(cmd.Error))
    {
        msg = cmd.Error;
    }
    else
    {
        msg = cmd.Result;
    }
    ssh.Disconnect();
    return msg;
}
```

代码功能比较简单，就是传入Shell命令，让远程服务器执行，有内容返回就返回输出。

## 踩坑点

每次RunCommand()这个方法，执行和返回的remote path，都是在~/下，如果我执行cd /test，再执行ls，是切不到test的目录下的，ls返回的列表，还是~/下的目录和文件。所以我们需要写成cd /test;ls才行

## 对docker container进行操作

能远程执行shell了，下一步就是对container进行操作，我原来的操作命令是

```shell
docker-compose exec --user xxxxxxxxxxxxxxxxxxx
```

但是执行后给我返回

```shell
the input device is not a TTY
```

经过查找资料后得到的解释为

From [the `docker-compose exec` docs](https://docs.docker.com/compose/reference/exec/):

> Commands are by default allocating a TTY, so you can use a command such as docker-compose exec web sh to get an interactive prompt.

To disable this behavior, you can either the `-T` flag to disable pseudo-tty allocation:

```shell
docker-compose exec -T --user xxxxxxxxxxxxxxxxxxx
```

## 新的问题

最后我根据如上资料进行开发后，发现有的docker命令可以操作，没问题，但有的命令操作了也无法成功，去SSH客户端里操作没问题，但一时半会也不知道怎么解决了，先这么搁置了……

## 资料来源

- [C#远程执行Linux系统中Shell命令和SFTP上传文件](https://www.cnblogs.com/songxingzhu/p/6095422.html)
- [C# 利用Ssh.Net 远程登陆Linux 以及所遇到的坑](https://blog.csdn.net/qq_38125728/article/details/98870998)
- [docker-compose exec python the input device is not a TTY in AWS EC2 UserData](https://stackoverflow.com/questions/49724232/docker-compose-exec-python-the-input-device-is-not-a-tty-in-aws-ec2-userdata)
