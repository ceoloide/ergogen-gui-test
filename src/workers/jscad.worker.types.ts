export type JscadWorkerRequest = {
  type: 'batch_jscad_to_stl';
  cases: Array<{ name: string; jscad: string }>;
  configVersion: number;
};

export type JscadWorkerResponse = {
  type: 'success' | 'error';
  cases?: Record<string, { jscad: string; stl: string }>;
  error?: string;
  configVersion: number;
};
