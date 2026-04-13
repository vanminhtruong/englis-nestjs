import { defineAsyncComponent } from 'vue'

export function useCategoriesComponents() {
  const CategoriesHeader = defineAsyncComponent(
    () => import('../../component/CategoriesHeader.vue') as any
  )
  const AppLoading = defineAsyncComponent(
    () => import('../../../../components/common/AppLoading.vue') as any
  )
  const CategoriesEmpty = defineAsyncComponent(
    () => import('../../component/CategoriesEmpty.vue') as any
  )
  const CategoriesGrid = defineAsyncComponent(
    () => import('../../component/CategoriesGrid.vue') as any
  )
  const CategoriesStickyButton = defineAsyncComponent(
    () => import('../../component/CategoriesStickyButton.vue') as any
  )
  const CategoryModal = defineAsyncComponent(
    () => import('../../component/CategoryModal.vue') as any
  )

  return {
    CategoriesHeader,
    AppLoading,
    CategoriesEmpty,
    CategoriesGrid,
    CategoriesStickyButton,
    CategoryModal,
  }
}
