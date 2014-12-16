# Muce FrontEnd
built with angular, and its ui-related components, to make us focus on biz development, and aims to expolore data visualization.


## Develop
```
git clone <>
npm install
bower install
grunt serve # disable browser check crossorign or add subdomin at wandoulabs at host
open -a /Applications/Google\ Chrome.app --args --disable-web-security
```


## Dependencies

- angular
- ui-router
- ui-bootstrap
- ui-grid
- ui-select2
- ngDialog
- angular-validator
- highchart
- ace editor
- tdbc
- knockout (abandoned)
- codemirror (abandoned)
- jquery-ui timepicker-addon (abandoned)

## Biz Modules

- report
- dashboard
- muce query
- subscribe
- channels
- analyze

## angularify

- [ ] more friendly bootstrap(less verbose ui def )
- [ ] more friendly form
- [x] more friendly api mapper

## Report Todo

- [ ] 加上 buzy 模块（global, btn, partial etc） 思考 loading indicator 怎么做
- [ ] 丰富 mock 数据（看看 Programtic 的方式怎么搞）
- [ ] 开始各种 transformer 了... 先对 add modal 回归下
- [ ] 把 multi-choose 移植到 metric modal 中
- [ ] report detail 的开发
- [ ] date-range 开发
- [ ] period group btn@setting 的显隐 控制
- [ ] dimension advanced 和外围的约束
- [ ] 对 formly 加上 validator 的支持
- [ ] 美化样式.... huge work!
