import CommentButton from "@/app/ui/buton/CommentButton";
import LikeButton from "@/app/ui/buton/LikeButton";
import TechBoxActive from "@/app/ui/techNew/TechBoxActive";
import Image from "next/image";
import { env } from "@/libs/env.helper";


//fetch detail technology news
const fetchTechNew = async(id: string) => {
  const res = await fetch(`${env.API_URL}/techNews/${id}`, {
    cache: 'force-cache',
    next: { revalidate: 60 }
  });
  if(!res.ok) {
    throw console.error ('fetch data is failed!');
  }
  return res.json();
};

export default async function Page({
    params,
  }: {
    params: Promise<{ id: string }>
  }) {
    const { id } = await params
    const techNew = await fetchTechNew(id);
    return (
      <div className="grid grid-cols bg-gray-100 justify-center">
          <div className="w-[1200px] bg-white p-8 mt-2 mb-2">
            <p className="text-gray-500 text-sm">
                {new Date(techNew.data.date).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
            </p>
            <div className="mt-5">
                <h1 className="text-left font-bold text-2xl mb-3">
                {techNew.data.title}
                </h1>
                <p className="text-left font-bold mb-2">
                {techNew.data.description}
                </p>
                <Image
                className="mb-3"
                alt={`blog image id : ${id}`}
                src={techNew.data.thumbnail}
                height={500}
                width={1000}
                ></Image>
                {techNew.data.content.split('\n\n').map((paragraph: string, index: number) => (
                <p key={index} className="text-justify leading-relaxed mt-5">
                    {paragraph}
                </p>
                ))}
                <div className="flex gap-x-2">
                <LikeButton /> 
                <CommentButton />
                </div>
            </div>
            <div className="pt-2 pb-2">
                <hr/>
                <p className="text-[24px] font-bold mt-3 mb-2">BÌNH LUẬN CỦA BẠN ĐỌC</p>
                <p className="text-gray-500">Chưa có bình luận nào.</p>
            </div>
            <div>
                <hr/>
                <p className="text-[24px] font-bold mt-3">TIN TỨC LIÊN QUAN</p>
                <TechBoxActive />
            </div>
          </div>
      </div>
    )
  }