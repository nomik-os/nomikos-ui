import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { contentApi, type ContentData } from '../services/contentApi';

interface ContentContextType {
  content: ContentData | null;
  loading: boolean;
  error: string | null;
}

const ContentContext = createContext<ContentContextType>({
  content: null,
  loading: true,
  error: null,
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contentApi
      .getAllContent()
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch content');
        setLoading(false);
      });
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, error }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}

export function useHeroStats() {
  const { content } = useContent();
  return content?.heroStats ?? [];
}

export function useNavLinks() {
  const { content } = useContent();
  return content?.navLinks ?? [];
}

export function useProblemStats() {
  const { content } = useContent();
  return content?.problemStats ?? [];
}

export function useProducts() {
  const { content } = useContent();
  return content?.products ?? [];
}

export function useHowSteps() {
  const { content } = useContent();
  return content?.howSteps ?? [];
}

export function useAudience() {
  const { content } = useContent();
  return content?.audience ?? [];
}

export function useTestimonials() {
  const { content } = useContent();
  return content?.testimonials ?? [];
}

export function usePricing() {
  const { content } = useContent();
  return content?.pricing ?? [];
}
