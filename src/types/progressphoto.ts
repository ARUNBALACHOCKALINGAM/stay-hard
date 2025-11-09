export interface ProgressPhoto {
  /**
   * Local unique identifier for UI (can be temporary during optimistic upload)
   */
  id: string;
  /** YYYY-MM-DD date the photo belongs to */
  date: string;
  /**
   * Object URL or data URL used as <img src>. For server-backed photos, we
   * generate an object URL from the authenticated blob stream.
   */
  dataUrl: string;
  /** Backend photo ID (e.g., GridFS/Mongo _id) when persisted on the server */
  backendId?: string;
  /** Whether this photo is currently uploading to the server */
  uploading?: boolean;
  /** ISO timestamp when photo was uploaded (from server) */
  uploadDate?: string;
}