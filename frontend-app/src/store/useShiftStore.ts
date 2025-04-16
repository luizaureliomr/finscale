import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos para o gerenciamento de estado
export interface Shift {
  id: string;
  institution: string;
  unit: string;
  date: string;
  startTime: string;
  endTime: string;
  value: number;
  status: 'scheduled' | 'completed' | 'canceled';
}

export interface ShiftFilters {
  startDate?: string;
  endDate?: string;
  institution?: string;
  status?: 'scheduled' | 'completed' | 'canceled';
}

interface ShiftState {
  shifts: Shift[];
  isLoading: boolean;
  error: string | null;
  filters: ShiftFilters;
  
  // Ações
  setShifts: (shifts: Shift[]) => void;
  addShift: (shift: Shift) => void;
  updateShift: (id: string, data: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: ShiftFilters) => void;
  clearFilters: () => void;
}

// Criação da store com persistência
const useShiftStore = create<ShiftState>()(
  persist(
    (set) => ({
      shifts: [],
      isLoading: false,
      error: null,
      filters: {},
      
      setShifts: (shifts) => set({ shifts }),
      
      addShift: (shift) => 
        set((state) => ({ 
          shifts: [...state.shifts, shift] 
        })),
      
      updateShift: (id, data) => 
        set((state) => ({
          shifts: state.shifts.map((shift) => 
            shift.id === id ? { ...shift, ...data } : shift
          )
        })),
      
      deleteShift: (id) => 
        set((state) => ({
          shifts: state.shifts.filter((shift) => shift.id !== id)
        })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setFilters: (filters) => 
        set((state) => ({
          filters: { ...state.filters, ...filters }
        })),
      
      clearFilters: () => set({ filters: {} }),
    }),
    {
      name: 'shift-storage', // nome da chave no localStorage
    }
  )
);

export default useShiftStore; 