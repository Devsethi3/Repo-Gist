export interface Tweet {
  id: string;
  content: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean; 
  };
}

export interface GridItem extends Tweet {
  x: number;
  y: number;
  w: number;
  h: number;
}