---
layout: post
title: "常用的VBA代码随笔记录"
subtitle: "No thing to say，就是工作常用罢了"
date: 2019-09-04 14:35:53
author: "邱陈程"
header-img: "img/title/2019/1556251157266.jpg"
tags:
- Excel
- VBA
- 程序
---


```vb
Sub 隐藏美服不需要关注的内容()
'
' 宏2 宏
'
' 快捷键: Ctrl+s
'
    Rows("8:10").Select
    Selection.EntireRow.Hidden = True
    Rows("15:15").Select
    Selection.EntireRow.Hidden = True
	Rows("17:23").Select
    Selection.EntireRow.Hidden = True
	Rows("25:25").Select
    Selection.EntireRow.Hidden = True
	Rows("28:32").Select
    Selection.EntireRow.Hidden = True
	Rows("36:37").Select
    Selection.EntireRow.Hidden = True
End Sub
```
```vb
Sub 隐藏不需要关注的日服内容()
'
' 宏2 宏
'
' 快捷键: Ctrl+s
'
    Rows("6:6").Select
    Selection.EntireRow.Hidden = True
    Rows("8:9").Select
    Selection.EntireRow.Hidden = True
	Rows("13:14").Select
    Selection.EntireRow.Hidden = True
	Rows("20:24").Select
    Selection.EntireRow.Hidden = True
	Rows("27:29").Select
    Selection.EntireRow.Hidden = True
	Rows("34:41").Select
    Selection.EntireRow.Hidden = True
	Rows("43:43").Select
    Selection.EntireRow.Hidden = True
End Sub
```
 
--------
<small class="img-hint">欢迎关注我的微信公众号，获得更多游戏开发技术分享</small>
<img src="https://pinkuburu.github.io/img/qrcode.jpg" width="350" height="350"/>