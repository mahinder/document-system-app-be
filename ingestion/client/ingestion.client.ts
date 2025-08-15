export abstract class IngestionClient {
  abstract start(documentId: string): Promise<{ accepted: boolean }>;
  // For a real client, add: getStatusFromPython(jobId), fetchEmbeddings(), etc.
}
