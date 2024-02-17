---
title: "常用的VBA代码随笔记录"
date: 2019-09-04 14:35:53
author: "邱陈程"
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
    Rows("6:8").Select
    Selection.EntireRow.Hidden = True
    Rows("13:23").Select
    Selection.EntireRow.Hidden = True
    Rows("26:30").Select
    Selection.EntireRow.Hidden = True
    Rows("34:34").Select
    Selection.EntireRow.Hidden = True
    Rows("36:36").Select
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
    Rows("10:11").Select
    Selection.EntireRow.Hidden = True
    Rows("14:19").Select
    Selection.EntireRow.Hidden = True
    Rows("21:21").Select
    Selection.EntireRow.Hidden = True
    Rows("26:33").Select
    Selection.EntireRow.Hidden = True
    Rows("37:46").Select
    Selection.EntireRow.Hidden = True
    Rows("48:53").Select
    Selection.EntireRow.Hidden = True
End Sub

```

--------

