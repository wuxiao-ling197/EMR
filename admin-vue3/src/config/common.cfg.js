/** 定义业务类型枚举 */
export const BusinessEnum = {
  OUTPATIENT: '门诊',
  INPATIENT: '住院',
  CT: 'CT',
  PHYSICAL_EXAMINATION: '体检',
  EXAMINATION: '检查',
  TESTING: '检验'
}

/** 定义payload格式类型枚举 */
export const PayloadTypeEnum = {
  FORM: '表单',
  MARKDOWN: 'markdown',
}


/** 定义单条记录（payload）Form卡片 */
export const MRCard = {
  "key": 52497,
  "type": "card",
  "category": "container",
  "icon": "card",
  "widgetList": [],
  "options": {
    "name": "newRecord",
    "label": "newRecord",
    "hidden": false,
    "folded": false,
    "showFold": true,
    "cardWidth": "100%",
    "shadow": "never",
    "customClass": []
  },
  "id": "card47702"
}

/** vform表单基础配置json */
export const vFormConfigJson = {
  "widgetList": [],
  "formConfig": {
    "modelName": "formData",
    "refName": "vForm",
    "rulesName": "rules",
    "labelWidth": 150,
    "labelPosition": "left",
    "size": "",
    "labelAlign": "label-left-align",
    "cssCode": "",
    "customClass": [],
    "functions": "",
    "layoutType": "PC",
    "jsonVersion": 3,
    "onFormCreated": "",
    "onFormMounted": "",
    "onFormDataChange": ""
  }
}
/** 定义vform编辑器组件配置 */
export const vFormWidgets = {
  inputWidget: {
    "key": 20098,
    "type": "input",
    "icon": "text-field",
    "formItemFlag": true,
    "options": {
      "name": "本地设备",
      "label": "本地设备",
      "labelAlign": "",
      "type": "text",
      "defaultValue": "",
      "placeholder": "",
      "columnWidth": "200px",
      "size": "",
      "labelWidth": null,
      "labelHidden": false,
      "readonly": false,
      "disabled": false,
      "hidden": false,
      "clearable": true,
      "showPassword": false,
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "minLength": null,
      "maxLength": null,
      "showWordLimit": false,
      "prefixIcon": "",
      "suffixIcon": "",
      "appendButton": false,
      "appendButtonDisabled": false,
      "buttonIcon": "custom-search",
      "onCreated": "",
      "onMounted": "",
      "onInput": "",
      "onChange": "",
      "onFocus": "",
      "onBlur": "",
      "onValidate": "",
      "onAppendButtonClick": ""
    },
    "id": "本地设备"
  },
  numberWidget: {
    "key": 18758,
    "type": "number",
    "icon": "number-field",
    "formItemFlag": true,
    "options": {
      "name": "月收入",
      "label": "月收入",
      "labelAlign": "",
      "defaultValue": 0,
      "placeholder": "",
      "columnWidth": "200px",
      "size": "",
      "labelWidth": null,
      "labelHidden": false,
      "disabled": false,
      "hidden": false,
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "min": -100000000000,
      "max": 100000000000,
      "precision": 0,
      "step": 1,
      "controlsPosition": "right",
      "onCreated": "",
      "onMounted": "",
      "onChange": "",
      "onFocus": "",
      "onBlur": "",
      "onValidate": ""
    },
    "id": "月收入"
  },
  radioWidget: {
    "key": 78383,
    "type": "radio",
    "icon": "radio-field",
    "formItemFlag": true,
    "options": {
      "name": "radio106897",
      "label": "radio",
      "labelAlign": "",
      "defaultValue": null,
      "columnWidth": "200px",
      "size": "",
      "displayStyle": "inline",
      "buttonStyle": false,
      "border": false,
      "labelWidth": null,
      "labelHidden": false,
      "disabled": false,
      "hidden": false,
      "optionItems": [
        {
          "label": "radio 1",
          "value": 1
        },
        {
          "label": "radio 2",
          "value": 2
        },
        {
          "label": "radio 3",
          "value": 3
        }
      ],
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "onCreated": "",
      "onMounted": "",
      "onChange": "",
      "onValidate": ""
    },
    "id": "月收入"
  },
  textareaWidget: {
    "key": 83155,
    "type": "textarea",
    "icon": "textarea-field",
    "formItemFlag": true,
    "options": {
      "name": "textarea99752",
      "label": "textarea",
      "labelAlign": "",
      "rows": 3,
      "defaultValue": "",
      "placeholder": "",
      "columnWidth": "200px",
      "size": "",
      "labelWidth": null,
      "labelHidden": false,
      "readonly": false,
      "disabled": false,
      "hidden": false,
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "minLength": null,
      "maxLength": null,
      "showWordLimit": false,
      "onCreated": "",
      "onMounted": "",
      "onInput": "",
      "onChange": "",
      "onFocus": "",
      "onBlur": "",
      "onValidate": ""
    },
    "id": "textarea99752"
  },
  checkboxWidget: {
    "key": 79952,
    "type": "checkbox",
    "icon": "checkbox-field",
    "formItemFlag": true,
    "options": {
      "name": "checkbox77405",
      "label": "checkbox",
      "labelAlign": "",
      "defaultValue": [],
      "columnWidth": "200px",
      "size": "",
      "displayStyle": "inline",
      "buttonStyle": false,
      "border": false,
      "labelWidth": null,
      "labelHidden": false,
      "disabled": false,
      "hidden": false,
      "optionItems": [
        {
          "label": "check 1",
          "value": 1
        },
        {
          "label": "check 2",
          "value": 2
        },
        {
          "label": "check 3",
          "value": 3
        }
      ],
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": [],
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "onCreated": "",
      "onMounted": "",
      "onChange": "",
      "onValidate": ""
    },
    "id": "checkbox77405"
  },
  selectWidget: {
    "key": 34896,
    "type": "select",
    "icon": "select-field",
    "formItemFlag": true,
    "options": {
      "name": "select104483",
      "label": "select",
      "labelAlign": "",
      "defaultValue": "",
      "placeholder": "",
      "columnWidth": "200px",
      "size": "",
      "labelWidth": null,
      "labelHidden": false,
      "disabled": false,
      "hidden": false,
      "clearable": true,
      "filterable": false,
      "allowCreate": false,
      "remote": false,
      "automaticDropdown": false,
      "multiple": false,
      "multipleLimit": 0,
      "optionItems": [
        {
          "label": "select 1",
          "value": 1
        },
        {
          "label": "select 2",
          "value": 2
        },
        {
          "label": "select 3",
          "value": 3
        }
      ],
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "onCreated": "",
      "onMounted": "",
      "onRemoteQuery": "",
      "onChange": "",
      "onFocus": "",
      "onBlur": "",
      "onValidate": ""
    },
    "id": "select104483"
  },
  timeWidget: {
    "key": 96927,
    "type": "time",
    "icon": "time-field",
    "formItemFlag": true,
    "options": {
      "name": "time72229",
      "label": "time",
      "labelAlign": "",
      "defaultValue": null,
      "placeholder": "",
      "columnWidth": "200px",
      "size": "",
      "autoFullWidth": true,
      "labelWidth": null,
      "labelHidden": false,
      "readonly": false,
      "disabled": false,
      "hidden": false,
      "clearable": true,
      "editable": false,
      "format": "HH:mm:ss",
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "onCreated": "",
      "onMounted": "",
      "onChange": "",
      "onFocus": "",
      "onBlur": "",
      "onValidate": ""
    },
    "id": "time72229"
  },
  timeRangeWidget: {
    "key": 42220,
    "type": "time-range",
    "icon": "time-range-field",
    "formItemFlag": true,
    "options": {
      "name": "timerange45477",
      "label": "time-range",
      "labelAlign": "",
      "defaultValue": null,
      "startPlaceholder": "",
      "endPlaceholder": "",
      "columnWidth": "200px",
      "size": "",
      "autoFullWidth": true,
      "labelWidth": null,
      "labelHidden": false,
      "readonly": false,
      "disabled": false,
      "hidden": false,
      "clearable": true,
      "editable": false,
      "format": "HH:mm:ss",
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "onCreated": "",
      "onMounted": "",
      "onChange": "",
      "onFocus": "",
      "onBlur": "",
      "onValidate": ""
    },
    "id": "timerange45477"
  },
  dateWidget: {
    "key": 67485,
    "type": "date",
    "icon": "date-field",
    "formItemFlag": true,
    "options": {
      "name": "date106370",
      "label": "date",
      "labelAlign": "",
      "type": "datetime",
      "defaultValue": null,
      "placeholder": "",
      "columnWidth": "200px",
      "size": "",
      "autoFullWidth": true,
      "labelWidth": null,
      "labelHidden": false,
      "readonly": false,
      "disabled": false,
      "hidden": false,
      "clearable": true,
      "editable": false,
      "format": "YYYY-MM-DD HH:mm:ss",
      "valueFormat": "YYYY-MM-DD HH:mm:ss",
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "onCreated": "",
      "onMounted": "",
      "onChange": "",
      "onFocus": "",
      "onBlur": "",
      "onValidate": ""
    },
    "id": "date106370"
  },
  dateRangeWidget: {
    "key": 6908,
    "type": "date-range",
    "icon": "date-range-field",
    "formItemFlag": true,
    "options": {
      "name": "daterange80438",
      "label": "date-range",
      "labelAlign": "",
      "type": "daterange",
      "defaultValue": null,
      "startPlaceholder": "",
      "endPlaceholder": "",
      "columnWidth": "200px",
      "size": "",
      "autoFullWidth": true,
      "labelWidth": null,
      "labelHidden": false,
      "readonly": false,
      "disabled": false,
      "hidden": false,
      "clearable": true,
      "editable": false,
      "format": "YYYY-MM-DD",
      "valueFormat": "YYYY-MM-DD",
      "required": false,
      "requiredHint": "",
      "validation": "",
      "validationHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "onCreated": "",
      "onMounted": "",
      "onChange": "",
      "onFocus": "",
      "onBlur": "",
      "onValidate": ""
    },
    "id": "daterange80438"
  },
  // 练级选择
  cascader: {
    "key": 54673,
    "type": "cascader",
    "icon": "cascader-field",
    "formItemFlag": true,
    "options": {
      "name": "cascader26612",
      "label": "cascader",
      "labelAlign": "",
      "defaultValue": "",
      "placeholder": "",
      "size": "",
      "labelWidth": null,
      "labelHidden": false,
      "columnWidth": "200px",
      "disabled": false,
      "hidden": false,
      "clearable": true,
      "filterable": false,
      "multiple": false,
      "checkStrictly": false,
      "showAllLevels": true,
      "optionItems": [
        {
          "label": "select 1",
          "value": 1,
          "children": [
            {
              "label": "child 1",
              "value": 11
            }
          ]
        },
        {
          "label": "select 2",
          "value": 2
        },
        {
          "label": "select 3",
          "value": 3
        }
      ],
      "required": false,
      "requiredHint": "",
      "customRule": "",
      "customRuleHint": "",
      "customClass": "",
      "labelIconClass": null,
      "labelIconPosition": "rear",
      "labelTooltip": null,
      "onCreated": "",
      "onMounted": "",
      "onChange": "",
      "onFocus": "",
      "onBlur": "",
      "onValidate": ""
    },
    "id": "cascader26612"
  }

}

/** 定义vform编辑器容器组件配置 */
export const vFormContainer = {
  gridContainer: {
    "key": 61387,
    "type": "grid",
    "category": "container",
    "icon": "grid",
    "cols": [],
    "options": {
      "name": "grid48857",
      "hidden": false,
      "gutter": 12,
      "colHeight": null,
      "customClass": ""
    },
    "id": "grid48857"
  },
  tableContainer: {
    "key": 49163,
    "type": "table",
    "category": "container",
    "icon": "table",
    "rows": [
      {
        "cols": [
          {
            "type": "table-cell",
            "category": "container",
            "icon": "table-cell",
            "internal": true,
            "widgetList": [],
            "merged": false,
            "options": {
              "name": "table-cell-102049",
              "cellWidth": "",
              "cellHeight": "",
              "colspan": 1,
              "rowspan": 1,
              "wordBreak": false,
              "customClass": ""
            },
            "id": "table-cell-102049"
          },
          {
            "type": "table-cell",
            "category": "container",
            "icon": "table-cell",
            "internal": true,
            "widgetList": [],
            "merged": false,
            "options": {
              "name": "table-cell-104671",
              "cellWidth": "",
              "cellHeight": "",
              "colspan": 1,
              "rowspan": 1,
              "wordBreak": false,
              "customClass": ""
            },
            "id": "table-cell-104671"
          }
        ],
        "id": "table-row-88586",
        "merged": false
      },
      {
        "cols": [
          {
            "type": "table-cell",
            "category": "container",
            "icon": "table-cell",
            "internal": true,
            "widgetList": [],
            "merged": false,
            "options": {
              "name": "table-cell-80586",
              "cellWidth": "",
              "cellHeight": "",
              "colspan": 1,
              "rowspan": 1,
              "wordBreak": false,
              "customClass": ""
            },
            "id": "table-cell-80586"
          },
          {
            "type": "table-cell",
            "category": "container",
            "icon": "table-cell",
            "internal": true,
            "widgetList": [],
            "merged": false,
            "options": {
              "name": "table-cell-107911",
              "cellWidth": "",
              "cellHeight": "",
              "colspan": 1,
              "rowspan": 1,
              "wordBreak": false,
              "customClass": ""
            },
            "id": "table-cell-107911"
          }
        ],
        "id": "table-row-27955",
        "merged": false
      }
    ],
    "options": {
      "name": "table44652",
      "hidden": false,
      "customClass": ""
    },
    "id": "table44652"
  },
  tabContainer: {
    "key": 73834,
    "type": "tab",
    "category": "container",
    "icon": "tab",
    "displayType": "border-card",
    "tabs": [
      {
        "type": "tab-pane",
        "category": "container",
        "icon": "tab-pane",
        "internal": true,
        "widgetList": [],
        "options": {
          "name": "tab1",
          "label": "tab 1",
          "hidden": false,
          "active": false,
          "disabled": false,
          "customClass": ""
        },
        "id": "tab-pane-90360"
      }
    ],
    "options": {
      "name": "tab104623",
      "hidden": false,
      "customClass": ""
    },
    "id": "tab104623"
  },
  cardContainer: {
    "key": 94805,
    "type": "card",
    "category": "container",
    "icon": "card",
    "widgetList": [],
    "options": {
      "name": "card91353",
      "label": "card",
      "hidden": false,
      "folded": false,
      "showFold": true,
      "cardWidth": "100%",
      "shadow": "never",
      "customClass": ""
    },
    "id": "card91353"
  }
}

/** 定义vue-markdown编辑器标准占位符枚举 */
export const standardPlaceholdersEnum = {
  FIELDS: '-{{}}',//字段名
  VALUES: '(())',
  TITLE: '### ',//标题
  DIAGNOSIS: '[[]]',//诊断
}
/** 定义vue-markdown编辑器标准占位符对应的正则表达式 */
export const standardPlaceholdersRegex = {
  FIELDS: /-\{\{([^}]+)\}\}/g,
  VALUES: /\(\(([^)]+)\)\)/g,
  TITLE: /^### (.*)$/gm,
  DIAGNOSIS: /\[\[([^\]]+)\]\]/g,
};
/** 增强版医疗占位符规范（支持动态交互） */
export const MedicalPlaceholders = {
  // 基础结构
  SECTION: '##@',       // 区块标题（如"##@诊断信息"）
  FIELD: '{{$}}',       // 字段占位（如"{{$姓名}}：((张三))"）
  VALUE: '(())',        // 值容器（需与FIELD配对）

  // 动态逻辑
  DIAGNOSIS: '[[ICD@]]',    // 诊断占位（自动关联ICD-10）
  CHECK_ITEM: '[[检查@]]',  // 检查项占位（根据诊断推荐）
  MEDICATION: '[[用药@]]',  // 药物占位（关联药品库）

  // 逻辑关系
  CONDITION: '{{if}}',  // 条件分支（如根据字段值显示不同内容）
};
// 匹配增强版占位符（支持嵌套和上下文）
export const MedicalPlaceholdersRegex = {
  SECTION: /^##@\s+(.*?)\s*##@/gm,                     // 匹配区块
  FIELD: /\{\{\$(\w+)\}\}:?\s*\(\(([^)]*)\)\)/g,       // 提取字段名和值
  DIAGNOSIS: /\[\[ICD@(?::(\w+))?\]\]/g,               // 提取诊断类型（如[[ICD@主诊断]]）
  CHECK_ITEM: /\[\[检查@([^\]]+)\]\]/g,                // 提取检查项上下文
  CONDITION: /\{\{if\s+([^}]+)\}\}([\s\S]*?)\{\{endif\}\}/g, // 条件逻辑
};

// deepseek API Keys
export const qdd_ds_key_nest = 'sk-d69be47fceaf4d6b995a813d6d5e6eda'