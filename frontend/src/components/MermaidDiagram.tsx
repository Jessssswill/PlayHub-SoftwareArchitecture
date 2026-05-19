import dynamic from 'next/dynamic';

const MermaidContent = dynamic(() => import('./MermaidContent'), { ssr: false });

interface Props {
  chart: string;
}

export default function MermaidDiagram({ chart }: Props) {
  return <MermaidContent chart={chart} />;
}
