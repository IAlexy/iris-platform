export type CircleJoinMode = 'InviteLinkOnly' | 'QrPass' | 'PeerReviewedApplication' | 'PublicDiscovery';
export type AiContentPolicy = 'Allowed' | 'MustBeLabeled' | 'StrictlyForbidden';
export type CircleRole = 'Owner' | 'Moderator' | 'Contributor' | 'Viewer';
export type TrustTier = 'Tier1_SmallPrivate' | 'Tier2_CommunityVerified' | 'Tier3_HighScaleOrMonetized';
export type SocialPlatform = 'Instagram' | 'Cara' | 'X' | 'Threads' | 'Reddit' | 'DirectUrl';

export interface CirclePolicy {
  joinMode: CircleJoinMode;
  applicationRequiredPhotos: number;
  applicationApprovalQuorum: number;
  qrPassEnabled: boolean;
  qrPassDefaultRole: CircleRole;
  qrPassExpiresAt?: string;
  aiContentPolicy: AiContentPolicy;
  requireHumanProofOrCameraExif: boolean;
  stripGpsMetadata: boolean;
  preserveCameraGearExif: boolean;
  enableArtCritiquePins: boolean;
  monetizationMode: string;
  maxFreePhotos: number;
}

export interface CircleSummary {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  ownerUserId: string;
  trustTier: TrustTier;
  memberCount: number;
  publicationCount: number;
  policy: CirclePolicy;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  readSasUrl: string;
  blurHash?: string;
  width: number;
  height: number;
  orderIndex: number;
}

export interface CritiquePin {
  id: string;
  authorUserId: string;
  authorDisplayName: string;
  xPercent: number; // 0..100
  yPercent: number; // 0..100
  category: string;
  comment: string;
  createdAt: string;
}

export interface Publication {
  id: string;
  circleId: string;
  albumId?: string;
  authorUserId: string;
  authorDisplayName: string;
  caption: string;
  exifCameraGear?: string;
  isHumanProofVerified: boolean;
  isAiFlagged: boolean;
  originalSourceUrl?: string;
  originalAuthorAttribution?: string;
  createdAt: string;
  mediaAssets: MediaAsset[];
  critiquePins: CritiquePin[];
}

export interface SocialImportPayload {
  circleId: string;
  albumId?: string;
  postUrl: string;
}
