export interface Comment {
  id: number;
  content: string;
  author_id: number;
  article_id: number;
  created_date: string;
  parent_id: number | null;
  author_name: string;
}
