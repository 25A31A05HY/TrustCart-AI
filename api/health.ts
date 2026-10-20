
export default function handler(req: any, res: any) {
  return res.status(200).json({
    status: 'healthy',
    message: 'Vercel API function is running'
  });
}
