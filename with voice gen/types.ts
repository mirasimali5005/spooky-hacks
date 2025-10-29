
export interface WikiSubject {
  subjectName: string;
  wikipediaTitle: string;
  pageid: number;
}

export interface PathStep extends WikiSubject {
  connectingLinkTitle: string | null;
}

export interface WikiPathResponse {
  start: WikiSubject;
  end: WikiSubject;
  path: PathStep[];
}
