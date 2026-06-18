export type WorkoutFormat = 'for_time' | 'amrap' | 'emom' | 'intervals' | 'for_load' | 'chipper' | 'ladder' | 'classic';
export interface Movement { id: string; name: string; category: string; equipment: string[]; }
export interface Workout { id: string; name: string; format: WorkoutFormat; movements: any[]; }
