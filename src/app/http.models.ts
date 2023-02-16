/**
 * @category Model
 * @category HTTP
 */
export interface ResponseError {
    name: string[]
    outputSummary: string[]
    logsFile: string
}
/**
 * @category Model
 * @category HTTP
 */
export interface ResponseResult {
    title: string
    status: 'OK' | 'KO'
    executionDate: string
    duration: number
    errors?: ResponseError[]
    fullOutput?: string
}
/**
 * @category Model
 * @category HTTP
 */
export interface ResponseSummary {
    results: ResponseResult[]
}
/**
 * @category Model
 * @category HTTP
 */
export interface ResponseNode {
    failed?: boolean
    level: 'INFO' | 'WARNING' | 'ERROR'
    attributes: {
        service: string
        method: 'GET' | 'POST' | 'PUT' | 'DELETE'
        traceId: string
    }
    labels: [string]
    text: string
    data: unknown
    contextId: string
    parentContextId: string
    timestamp: number
}
/**
 * @category Model
 * @category HTTP
 */
export interface ResponseNodes {
    nodes: ResponseNode[]
}
