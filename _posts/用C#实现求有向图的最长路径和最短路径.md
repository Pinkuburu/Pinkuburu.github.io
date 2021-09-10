用C#实现求有向图的最长路径和最短路径
最近两天心血来潮，在研究数据结构，研究有向无环图如何求最短路径和最长路径，可是翻阅了一些资料，都没咋看懂，网上也没有找到什么这方面的解决方案，于是，自己实现一下这个算法吧。

自己的大致实现思路：从终点开始往前找，把每一条从起点开始的路都找出来，最后进行路程的比较，便可以得到相应的最短路径和最长路径。

测试示例如下图：

![img](../img/inpost/202107/%E7%94%A8C%23%E5%AE%9E%E7%8E%B0%E6%B1%82%E6%9C%89%E5%90%91%E5%9B%BE%E7%9A%84%E6%9C%80%E9%95%BF%E8%B7%AF%E5%BE%84%E5%92%8C%E6%9C%80%E7%9F%AD%E8%B7%AF%E5%BE%84/5cf4e40bee83384475.jpg)

实现目标：

最短路径：A-B-D-E，路程为8

最长路径：A-B-C-D-E，路程为12

# 开始撸代码

准备两个实体类Node和Route，Node即每个节点，Route用于保存两个节点间的距离：
```c#
    ////// 路由
    //////public class Route{
        public Route(Nodesrc, Nodedest, int distance)
        {
            Source = src;
            Dest = dest;
            Distance = distance;
        }
        ////// 开始节点
        ///public NodeSource { get; set; }
        ////// 结束节点
        ///public NodeDest { get; set; }
        ////// 距离
        ///public int Distance { get; set; }
    }
    ////// 节点
    //////public class Node{
        public Node(string name)
        {
            Name = name;
            Prevs = new Dictionary();
        }
        ////// 节点名
        ///public string Name { get; set; }
        ////// 前面的节点以及到前一个节点需要的距离
        ///public Dictionary Prevs { get; set; }
    }
```
先初始化这5个节点的数据：
```c#
Nodea = new Node("A");
Nodeb = new Node("B");
Nodec = new Node("C");
Noded = new Node("D");
Nodee = new Node("E");
SetRoutePath(a, b, 1);
SetRoutePath(b, c, 2);
SetRoutePath(a, c, 2);
SetRoutePath(b, d, 3);
SetRoutePath(c, d, 5);
SetRoutePath(b, e, 9);
SetRoutePath(d, e, 4);
List nodes = new List()
{
    a,
    b,
    c,
    d,
    e
};
```
设置节点路由信息的方法：
```c#
private static void SetRoutePath(Nodestart, Nodeend, int distance)
{
    end.Prevs.Add(start, distance);
}
```
真正的核心业务代码：
```c#
    ////// 路由计算引擎
    //////public class RouteEngine{
        ////// 节点信息
        ///private List Nodes { get; set; }
        ////// 路由结果
        ///private Dictionary RouteList { get; set; } = new Dictionary();
        public RouteEngine(List nodes)
        {
            Nodes = nodes;
        }
        ////// 递归将每条路都计算出来
        ////////////private void InterateRoute(Nodenode, string route, int dis)
        {
            if (node.Prevs.Any())
            {
                foreach (var prev in node.Prevs)
                {
                    RouteList[prev.Key.Name + "," + route] = dis + prev.Value;
                    InterateRoute(prev.Key, prev.Key.Name + "," + route, dis + prev.Value);
                }
            }
        }
        ////// 获得路径
        ///////////////public (List, HashSet) GetRoutes(Nodestart, Nodeend, bool shortest)
        {
            InterateRoute(end, end.Name, 0);
            var list = new List();
            var nodes = new HashSet();
            var routes = RouteList.Where(k => k.Key.StartsWith(start.Name) && k.Key.EndsWith(end.Name));
            var route = (shortest ? routes.OrderBy(x => x.Value) : routes.OrderByDescending(x => x.Value)).FirstOrDefault().Key;
            string[] strs = route.Split(',');
            for (var i = 0; i < strs.Length - 1; i++) { Nodesrc = Nodes.Find(n => n.Name.Equals(strs[i]));
                Nodedest = Nodes.Find(n => n.Name.Equals(strs[i + 1]));
                list.Add(new Route(src, dest, dest.Prevs[src]));
                nodes.Add(src);
                nodes.Add(dest);
            }
            return (list, nodes);
        }
    }
```
通过递归，把每个节点到起点的路径都找出来存到RouteList中，最后筛选出起点到终点的最短和最长路径。

# 运行结果：

![img](../img/inpost/202107/%E7%94%A8C%23%E5%AE%9E%E7%8E%B0%E6%B1%82%E6%9C%89%E5%90%91%E5%9B%BE%E7%9A%84%E6%9C%80%E9%95%BF%E8%B7%AF%E5%BE%84%E5%92%8C%E6%9C%80%E7%9F%AD%E8%B7%AF%E5%BE%84/5cf4e40cef0a921927.jpg)


完整代码：
```c#
    ////// 路由计算引擎
    //////public class RouteEngine{
        ////// 节点信息
        ///private List Nodes { get; set; }
        ////// 路由结果
        ///private Dictionary RouteList { get; set; } = new Dictionary();
        public RouteEngine(List nodes)
        {
            Nodes = nodes;
        }
        ////// 递归将每条路都计算出来
        ////////////private void InterateRoute(Nodenode, string route, int dis)
        {
            if (node.Prevs.Any())
            {
                foreach (var prev in node.Prevs)
                {
                    RouteList[prev.Key.Name + "," + route] = dis + prev.Value;
                    InterateRoute(prev.Key, prev.Key.Name + "," + route, dis + prev.Value);
                }
            }
        }
        ////// 获得路径
        ///////////////public (List, HashSet) GetRoutes(Nodestart, Nodeend, bool shortest)
        {
            InterateRoute(end, end.Name, 0);
            var list = new List();
            var nodes = new HashSet();
            var routes = RouteList.Where(k => k.Key.StartsWith(start.Name) && k.Key.EndsWith(end.Name));
            var route = (shortest ? routes.OrderBy(x => x.Value) : routes.OrderByDescending(x => x.Value)).FirstOrDefault().Key;
            string[] strs = route.Split(',');
            for (var i = 0; i < strs.Length - 1; i++) { Nodesrc = Nodes.Find(n => n.Name.Equals(strs[i]));
                Nodedest = Nodes.Find(n => n.Name.Equals(strs[i + 1]));
                list.Add(new Route(src, dest, dest.Prevs[src]));
                nodes.Add(src);
                nodes.Add(dest);
            }
            return (list, nodes);
        }
    }
    ////// 路由
    //////public class Route{
        public Route(Nodesrc, Nodedest, int distance)
        {
            Source = src;
            Dest = dest;
            Distance = distance;
        }
        ////// 开始节点
        ///public NodeSource { get; set; }
        ////// 结束节点
        ///public NodeDest { get; set; }
        ////// 距离
        ///public int Distance { get; set; }
    }
    ////// 节点
    //////public class Node{
        public Node(string name)
        {
            Name = name;
            Prevs = new Dictionary();
        }
        ////// 节点名
        ///public string Name { get; set; }
        ////// 前面的节点以及到前一个节点需要的距离
        ///public Dictionary Prevs { get; set; }
    }
    class Program
    {
        static void Main(string[] args)
        {
            Nodea = new Node("A");
            Nodeb = new Node("B");
            Nodec = new Node("C");
            Noded = new Node("D");
            Nodee = new Node("E");
            SetRoutePath(a, b, 1);
            SetRoutePath(b, c, 2);
            SetRoutePath(a, c, 2);
            SetRoutePath(b, d, 3);
            SetRoutePath(c, d, 5);
            SetRoutePath(b, e, 9);
            SetRoutePath(d, e, 4);
            List nodes = new List()
            {
                a,
                b,
                c,
                d,
                e
            };
            var engine = new RouteEngine(nodes);
            var (routes, routeNodes) = engine.GetRoutes(a, e, false);
            foreach (var x in routes)
            {
                Console.WriteLine(x.Source.Name + "->" + x.Dest.Name + ":" + x.Distance);
            }
            Console.WriteLine("最长路径：" + string.Join("->", routeNodes.Select(x => x.Name)) + ":" + routes.Sum(r => r.Distance));
            (routes, routeNodes) = engine.GetRoutes(a, e, true);
            foreach (var x in routes)
            {
                Console.WriteLine(x.Source.Name + "->" + x.Dest.Name + ":" + x.Distance);
            }
            Console.WriteLine("最短路径：" + string.Join("->", routeNodes.Select(x => x.Name)) + ":" + routes.Sum(r => r.Distance));
        }
        private static void SetRoutePath(Nodestart, Nodeend, int distance)
        {
            end.Prevs.Add(start, distance);
        }
    }
```