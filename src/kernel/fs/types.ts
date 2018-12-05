import { Group, User } from '../types'

export type Permissions = number

enum INodeType {
  File,
  Directory
}

export interface INode {
  permissions: Permissions
  owner: User
  group: Group
  type: INodeType
}
