<template>
  <div
    class="app-shell min-h-screen bg-white dark:bg-black flex flex-col"
    :data-seasonal-event="activeEvent?.id"
    :data-seasonal-tone="activeEvent?.tone"
    :style="eventStyles"
    :data-seasonal-preview="previewing ? 'true' : undefined"
  >
    <SeasonalFrame v-if="activeEvent" />
    <AppHeader class="seasonal-header" />
    <div v-if="activeEvent" class="seasonal-garland" aria-hidden="true"><SeasonalMotifStrip :event-id="activeEvent.id" /></div>
    <SeasonalParticles v-if="activeEvent" :event-id="activeEvent.id" />
    <main class="seasonal-content flex-1">
      <SeasonalEventBanner
        v-if="activeEvent"
        :event="activeEvent"
        :previewing="previewing"
        @stop-preview="calendar.stopPreview"
      />
      <RouterView />
      <BackToTop />
    </main>
    <AppToastContainer />
    <DataShareIncomingModal />
    <AppFooter class="seasonal-footer">
      <template v-if="activeEvent" #seasonal-decoration>
        <div class="seasonal-footer-scene" aria-hidden="true">
          <img v-if="eventArt" :src="eventArt" class="seasonal-footer-art" alt="" loading="lazy" decoding="async" width="900" height="375" />
          <SeasonalMotifStrip :event-id="activeEvent.id" lazy />
        </div>
      </template>
    </AppFooter>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, provide, watch, watchEffect } from "vue";
import { RouterView } from "vue-router";
import SeasonalFrame from "../components/layout/SeasonalFrame.vue";
import SeasonalMotifStrip from "../components/layout/SeasonalMotifStrip.vue";
import SeasonalEventBanner from "../components/layout/SeasonalEventBanner.vue";
import {
  seasonalDecor,
  seasonalIllustration,
  seasonalScene,
  seasonalFrame,
  seasonalUiArtwork,
  seasonalUiArtworkKey,
} from "../utils/seasonalDecor";
import { seasonalCalendarKey, useSeasonalCalendar } from "../composables/useSeasonalCalendar";
import { useAuthStore } from "../stores/auth.store";
import "../styles/seasonal-theme.css";
import "../styles/seasonal-details.css";

const authStore = useAuthStore();
const calendar = useSeasonalCalendar();
provide(seasonalCalendarKey, calendar);

watch(() => authStore.user?.id, calendar.stopPreview);

const previewing = computed(() => authStore.isAuthenticated && !!calendar.previewEvent.value);
const activeEvent = computed(() => {
  if (!authStore.isAuthenticated) return undefined;
  return calendar.previewEvent.value
    ?? (authStore.user?.seasonalThemesEnabled ? calendar.schedule.value.active : undefined);
});

provide(
  seasonalUiArtworkKey,
  computed(() => activeEvent.value ? seasonalUiArtwork(activeEvent.value.id) : undefined)
);

const eventArt = computed(() => activeEvent.value ? seasonalScene(activeEvent.value.id) ?? seasonalIllustration(activeEvent.value.id) : undefined);
const eventStyles = computed(() => {
  if (!activeEvent.value) return undefined;
  const id = activeEvent.value.id;
  const decor = seasonalDecor[id];
  const illustration = seasonalScene(id) ?? seasonalIllustration(id);
  return {
    "--seasonal-action-mark": JSON.stringify(decor.action),
    "--seasonal-ornament-mark": JSON.stringify(decor.ornament),
    "--seasonal-detail-mark": JSON.stringify(decor.motifs[2]),
    "--seasonal-extra-mark": JSON.stringify(decor.motifs[3]),
    "--seasonal-artwork": illustration ? `url("${illustration}")` : undefined,
    "--seasonal-frame-art": `url("${seasonalFrame(id)}")`,
  };
});

// Teleported menus and dialogs live under body, outside the route layout.
const seasonalBodyKeys = ["--seasonal-action-mark", "--seasonal-ornament-mark", "--seasonal-detail-mark", "--seasonal-extra-mark", "--seasonal-artwork", "--seasonal-frame-art"] as const;
function clearSeasonalTheme() {
  delete document.documentElement.dataset.seasonalTone;
  delete document.body.dataset.seasonalEvent;
  delete document.body.dataset.seasonalTone;
  seasonalBodyKeys.forEach(key => document.body.style.removeProperty(key));
}
watchEffect(() => {
  const event = activeEvent.value;
  const styles = eventStyles.value;
  clearSeasonalTheme();
  if (!event || !styles) return;
  document.documentElement.dataset.seasonalTone = event.tone;
  document.body.dataset.seasonalEvent = event.id;
  document.body.dataset.seasonalTone = event.tone;
  for (const key of seasonalBodyKeys) {
    if (styles[key]) document.body.style.setProperty(key, styles[key]!);
  }
});
onBeforeUnmount(clearSeasonalTheme);

const SeasonalParticles = defineAsyncComponent(
  () => import("../components/layout/SeasonalParticles.vue")
);

const AppHeader = defineAsyncComponent(
  () => import("../components/layout/AppHeader.vue") as any
);
const AppFooter = defineAsyncComponent(
  () => import("../components/layout/AppFooter.vue") as any
);
const BackToTop = defineAsyncComponent(
  () => import("../components/common/BackToTop.vue") as any
);
const DataShareIncomingModal = defineAsyncComponent(
  () => import("../components/data-share/DataShareIncomingModal.vue") as any
);
const AppToastContainer = defineAsyncComponent(
  () => import("../components/common/AppToastContainer.vue") as any
);
</script>
