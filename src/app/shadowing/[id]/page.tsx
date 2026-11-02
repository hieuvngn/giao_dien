import VideoDetail from '@/components/shadowing/video-detail'

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <VideoDetail id={id} />
}
