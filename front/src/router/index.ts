import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/vocabulary',
      name: 'vocabulary',
      component: () => import('../views/Vocabulary/VocabularyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vocabulary/by-date',
      name: 'vocabulary-by-date',
      component: () => import('../views/VocabularyByDate/VocabularyByDateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/Favorites/FavoritesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/History/HistoryView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/voice-settings',
      name: 'voice-settings',
      component: () => import('../views/VoiceSettings/VoiceSettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../views/Categories/CategoriesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/categories/:id',
      name: 'category-detail',
      component: () => import('../views/Categories/CategoryDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('../views/Tags/TagsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tags/:id',
      name: 'tag-detail',
      component: () => import('../views/Tags/TagDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('../views/Practice/PracticeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About/AboutView.vue'),
    },
    {
      path: '/learning-progress',
      name: 'learning-progress',
      component: () => import('../views/LearningProgress/LearningProgressView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/vocabulary')
  } else {
    next()
  }
})

export default router
