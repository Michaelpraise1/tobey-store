import { type SchemaTypeDefinition } from 'sanity'

import { blockContentType } from './blockContentType'
import { categoryType } from './categoryType'
import { postType } from './postType'
import { authorType } from './authorType'
import { productType } from './productType'
import { orderType } from './orderType'
import { addressType } from './addressType'
import { blogCategoryType } from './blogCategoryType'
import { blogType } from './blogType'


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType, postType, authorType, productType, orderType, addressType, blogCategoryType, blogType],
}
