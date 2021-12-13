console.log('a...');
let b = 10;
let c = 20;

// export default b; // default只能导出一个
export { b, c }; // 可以导出多个，但是需要大括号包裹

// export { b as default }; // 比较诡异的写法，同上export default b;