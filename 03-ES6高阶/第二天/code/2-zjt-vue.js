// 作业：将Zvue模块化（划分两个模块：Zvue类和Compile类）

class Zvue extends EventTarget {
    constructor(options) {
        super(); // 继承以后需要super()一下
        this.$options = options;
        this.compile();
        this.observe(this.$options.data);
    }

    observe(data) {
        let keys = Object.keys(data);
        keys.forEach(key => {
            this.defineReact(data, key, data[key]);
        })
    }

    defineReact(data, key, value) {
        let _this = this;
        Object.defineProperty(data, key, {
            configurable: true, // 可配置
            enumerable: true, // 可枚举
            get() {
                console.log('get..');
                return value;
            },
            set(newValue) {
                console.log('set..', newValue);
                // let event = new Event(key);
                let event = new CustomEvent(key, {
                    detail: newValue
                })
                _this.dispatchEvent(event);
                value = newValue;
            }
        })
    }

    compile() {
        let el = document.querySelector(this.$options.el);
        this.compileNode(el);
    }

    compileNode(el) {
        let childNodes = el.childNodes;
        // console.log(childNodes);
        childNodes.forEach(node => {
            if (node.nodeType === 1) { // 标签
                // 递归调用 嵌套双向绑定
                // console.log(node.childNodes); // list
                if (node.childNodes.length > 0) {
                    this.compileNode(node);
                }

                // 指令实现
                let attrs = node.attributes;
                [...attrs].forEach(attr => {
                    let attrName = attr.name;
                    let attrValue = attr.value;
                    if (attrName.startsWith('v-', 0)) {
                        attrName = attrName.substr(2);
                        // 先判断data中有没有此项数据
                        if (this.$options.data.hasOwnProperty(attrValue)) {
                            // 再判断是哪个指令
                            if (attrName === 'html') {
                                node.innerHTML = this.$options.data[attrValue];
                            } else if (attrName === 'model') {
                                // 1.当前节点的值要等于绑定的数据   数据 --->节点值
                                // 2.当前节点值发生变化时，数据也得发生变化   节点值--->数据
                                node.value = this.$options.data[attrValue];
                                node.addEventListener('input', e => {
                                    // console.log(e.target.value);
                                    this.$options.data[attrValue] = e.target.value;
                                })
                            }
                        } else {
                            throw new Error(`${attrValue} is not defined`);
                        }
                    }
                })
            } else if (node.nodeType === 3) { // 文本
                let reg = /\{\{\s*(\S+)\s*\}\}/g;
                let textContent = node.textContent;
                if (reg.test(textContent)) {
                    // console.log('存在双花括号');
                    let $1 = RegExp.$1;
                    if (this.$options.data.hasOwnProperty($1)) {
                        // node.textContent = this.$options.data[$1];
                        // 上述写法前后如果有内容，也会一并替换掉，用replace去替换正则匹配的内容
                        node.textContent = node.textContent.replace(reg, this.$options.data[$1]);
                        this.addEventListener($1, e => {
                            // console.log('触发了修改')
                            // 重新渲染视图
                            // console.log(e);
                            let oldValue = this.$options.data[$1];
                            let _reg = new RegExp(oldValue);
                            node.textContent = node.textContent.replace(_reg, e.detail);

                        })
                    } else {
                        throw new Error(`${$1} is not defined`);
                    }
                }
            }
        })
    }
}
