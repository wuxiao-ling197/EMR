// AI相关的方法
import request from '@/utils/request'

/******************deepseekAPI相关api********************/
/**
 * 调用dsAPI
 * @param {*} query 
 * @returns 
 */
export function testDSAPI(data) {
    console.log(data);

    return request({
        url: '/emrManage/deepseek/testDSAPI',
        method: 'post',
        data: { question: data }
    })
}

/**
 * 通过硅基流动调用ds
 * @param {*} query 
 * @returns 
 */
export function testSiliconFlowAPI(data) {
    const silicon_flow_key = 'sk-lvebmoiriqkwzdrexhsejqsmjnluanukkeikleyvmswsfwgq'
    const content = "1+1等于"
    const options = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${silicon_flow_key}`,
            'Content-Type': 'application/json'
        },
        body: {
            "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
            "stream": false,
            "max_tokens": 512,
            "temperature": 0.7,
            "top_p": 0.7,
            "top_k": 50,
            "frequency_penalty": 0.5,
            "n": 1,
            "messages": [{
                "content": content,
                "role": "user"
            }]
        }
    };
    fetch('https://api.siliconflow.cn/v1/chat/completions', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}