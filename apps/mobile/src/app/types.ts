import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  TaskDetail: { taskId: string };
  TakeTaskPhoto: { taskId: string; type: 'BEFORE' | 'AFTER' };
};

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Ponto: undefined;
  Photo: undefined;
};
