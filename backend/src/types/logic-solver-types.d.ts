declare module 'logic-solver' {
  export class Solver {
    constructor();
    require(constraint: any): void;
    solve(): Solution | null;
    // Add other methods as you use them, or keep them as 'any'
    [key: string]: any; 
  }

  export class Solution {
    getMap(): Record<string, boolean>;
    getTrueVars(): string[];
    [key: string]: any;
  }

  // This allows the "import Logic from 'logic-solver'" syntax
  const Logic: {
    Solver: typeof Solver;
    Solution: typeof Solution;
    [key: string]: any;
  };
  
  export default Logic;
}