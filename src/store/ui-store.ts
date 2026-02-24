import { create } from 'zustand';
import { SidebarTab } from '@/types';

interface UIState {
  activeSidebarTab: SidebarTab;
  sidebarCollapsed: boolean;
  propertiesPanelOpen: boolean;
  layerPanelOpen: boolean;
  exportModalOpen: boolean;
  saveModalOpen: boolean;
  templateModalOpen: boolean;
  isLoading: boolean;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;

  // Actions
  setActiveSidebarTab: (tab: SidebarTab) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setPropertiesPanelOpen: (open: boolean) => void;
  setLayerPanelOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setSaveModalOpen: (open: boolean) => void;
  setTemplateModalOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeSidebarTab: 'templates',
  sidebarCollapsed: false,
  propertiesPanelOpen: true,
  layerPanelOpen: false,
  exportModalOpen: false,
  saveModalOpen: false,
  templateModalOpen: false,
  isLoading: false,
  notification: null,

  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setPropertiesPanelOpen: (open) => set({ propertiesPanelOpen: open }),
  setLayerPanelOpen: (open) => set({ layerPanelOpen: open }),
  setExportModalOpen: (open) => set({ exportModalOpen: open }),
  setSaveModalOpen: (open) => set({ saveModalOpen: open }),
  setTemplateModalOpen: (open) => set({ templateModalOpen: open }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  showNotification: (message, type) => set({ notification: { message, type } }),
  clearNotification: () => set({ notification: null }),
}));
