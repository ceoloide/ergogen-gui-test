export type JscadWorkerRequest = {
  type: 'jscad_to_stl';
  jscad: string;
  requestId: string;
};

export type JscadWorkerResponse = {
  type: 'success' | 'error';
  stl?: string;
  error?: string;
  requestId: string;
};