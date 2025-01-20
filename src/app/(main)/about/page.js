import React from 'react'
import { TextAnimate } from "@/components/magicui/text-animate";

const aboutPage = () => {
  return (
    <div className='h-screen container'>
    <h1 className="text-5xl font-bold tracking-tight mb-6">
      <TextAnimate animation="slideUp" by="word">
        Slide up by word
      </TextAnimate>
    </h1>
    <h1 className="text-5xl font-bold tracking-tight mb-6">
      <TextAnimate animation="slideUp" by="word">
        Slide up by word
      </TextAnimate>
    </h1>
    <h1 className="text-5xl font-bold tracking-tight mb-6">
      <TextAnimate animation="slideUp" by="word">
        Slide up by word
      </TextAnimate>
    </h1>
    <h1 className="text-5xl font-bold tracking-tight mb-6">
      <TextAnimate animation="slideUp" by="word">
        Slide up by word
      </TextAnimate>
    </h1>
    <h1 className="text-5xl font-bold tracking-tight mb-6">
      <TextAnimate animation="slideUp" by="word">
        Slide up by word
      </TextAnimate>
    </h1>
    </div>
  )
}

export default aboutPage