export interface HNode {
  level: number
  text: string
}

export interface ContentMessage {
  type: string
  data: Array<HNode>
}
