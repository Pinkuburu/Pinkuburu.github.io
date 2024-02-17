在项目中大家肯定偶尔会有遍历文件夹的需求，还在老老实实写递归么？！那怕是骚一点的linq递归，其实都太麻烦了，微软爸爸早就想到我们有这样的需求，直接在框架内部已经实现好了。

遍历文件夹其实只需要一个函数就搞定了，都不用去考虑递归，真的太 弓虽 了。

```c#
var files = Directory.GetFiles(@"C:\", "*.*",SearchOption.AllDirectories); // 遍历所有文件
var dirs= Directory.GetDirectories(@"C:\", "*", SearchOption.AllDirectories); //遍历所有文件夹
```

其中第三个参数SearchOption.AllDirectories表示搜索本文件夹和所有子目录，很碉堡吧。

"*.*"也可以是"*"，通配符都一样。通配符支持*，?，跟Windows资源管理器套路是一样的，

如果再加一句：

```c#
var list=files.Union(dirs).OrderBy(s=>s);
```

那不就实现了当前文件夹递归的结果包含文件和文件夹的同时遍历了么！

原文地址：https://ldqk.xyz/1878

