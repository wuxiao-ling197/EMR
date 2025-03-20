import { generateTemplateApi } from '@/api/medicalRecord/formCreate';
// vform表单相关配置
import { vFormWidgets, vFormConfigJson as formJson, vFormContainer } from '@/config/common.cfg.js'

// 定义表单创建后的方法
function onFormMounted() {

}
// 动态生成没有容器的表单widget
async function generateTemplate(key, contFormat = 'grid') {
    // 初始化一下
    console.log(key);
    let widgetList = []
    let formateWidgetList = []
    let res = await generateTemplateApi(key)
    // console.log(res);
    if (res.code === 200) {
        res.data.forEach(el => {
            let newWidget = createNewWidget(el);
            if (newWidget) {
                widgetList.push(newWidget);
            }
        });
    }
    // 如果有格式，生成格式化模板
    let hasFormat = true
    if (hasFormat) {
        let res = generateContainer(contFormat, widgetList)
        formateWidgetList.push(res)
    } else {
        formateWidgetList = widgetList
    }
    return formateWidgetList;
};

// 根据字段组件list和格式动态生成表单widget
function generateContainer(container, widgetList) {
    let newContainer = null;
    function generGrid() {
        newContainer = JSON.parse(JSON.stringify(vFormContainer.gridContainer))
        let colsItem = {
            "type": "grid-col",
            "category": "container",
            "icon": "grid-col",
            "internal": true,
            "widgetList": [],
            "options": {
                "name": "gridCol106374",
                "hidden": false,
                "span": 12,
                "offset": 0,
                "push": 0,
                "pull": 0,
                "responsive": false,
                "md": 12,
                "sm": 12,
                "xs": 12,
                "customClass": ""
            },
            "id": "grid-col-106374"
        }
        widgetList.forEach(wd => {
            let itemJson = JSON.parse(JSON.stringify(colsItem))
            itemJson.id = `grid-col-${wd.id}`
            itemJson.options.name = `gridCol${wd.id}`
            // console.log(wd);
            // 将字段组件加入grid格子组件
            itemJson.widgetList.push(wd)
            console.log(itemJson);
            // 将格子组件推入栅格组件
            newContainer.cols.push(itemJson)
        })
    }
    switch (container) {
        case 'grid':
            generGrid()
            break;
        case 'table':
            break;
        case 'tab':
            break;
        case 'card':
            break;
        default:
            return;
    }
    return newContainer;
}
export default generateTemplate;

// 提取重复逻辑到单独的函数
function createNewWidget(el) {
    let newWidget = {};
    switch (el.type) {
        case 'input':
            newWidget = JSON.parse(JSON.stringify(vFormWidgets.inputWidget));
            break;
        case 'number':
            newWidget = JSON.parse(JSON.stringify(vFormWidgets.numberWidget));
            break;
        case 'select':
            newWidget = JSON.parse(JSON.stringify(vFormWidgets.selectWidget));
            break;
        case 'date':
            newWidget = JSON.parse(JSON.stringify(vFormWidgets.dateWidget));
            break;
        case 'radio':
            newWidget = JSON.parse(JSON.stringify(vFormWidgets.radioWidget));
            break;
        default:
            return null;
    }
    newWidget.options.name = el.name;
    newWidget.options.label = el.label;
    if (el.optionItems) {
        newWidget.options.optionItems = el.optionItems;
    }
    if (el.options) {
        Object.assign(newWidget.options, el.options);
    }
    newWidget.id = el.id;
    return newWidget;
}