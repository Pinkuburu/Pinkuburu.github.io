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
    Rows("6:9").Select
    Selection.EntireRow.Hidden = True
    Rows("13:30").Select
    Selection.EntireRow.Hidden = True
    Rows("32:32").Select
    Selection.EntireRow.Hidden = True
    Rows("34:35").Select
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
    Rows("8:11").Select
    Selection.EntireRow.Hidden = True
    Rows("13:13").Select
    Selection.EntireRow.Hidden = True
    Rows("15:16").Select
    Selection.EntireRow.Hidden = True
    Rows("21:28").Select
    Selection.EntireRow.Hidden = True
    Rows("30:30").Select
    Selection.EntireRow.Hidden = True
    Rows("35:47").Select
    Selection.EntireRow.Hidden = True
    Rows("49:55").Select
    Selection.EntireRow.Hidden = True
    Rows("57:57").Select
    Selection.EntireRow.Hidden = True
End Sub

```
 
--------

