


export type ChatItemPropsType = {
    image: string;
    name: string;
    toChangeUser: (name: string) => void;
    toRemoveUser: (name: string) => void;
    active: boolean;
  }
  