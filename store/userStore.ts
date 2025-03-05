import { create } from 'zustand'
import { persist,  } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type userStore = {
  eye: boolean
  setEye: (value: boolean) => void
}

export const useUserStore = create<userStore>()(
  persist(
    immer((set) => ({
      eye: true,
      setEye: (value:boolean) => set((state) => {
        state.eye = value
        }),
    })),
    {
      name: 'user-storage',
    },
  ),
)
