



export type ChatItemPropsType = {
    image: string | Element | any;
    name: string;
    toChangeUser?: (name: string) => void;
    toRemoveUser?: (name: string) => void;
    active?: boolean;
  }
  