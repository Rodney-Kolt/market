'use client';

import { useState } from 'react';
import type { Question, Answer } from '@/types';
import { timeAgo, getInitials } from '@/lib/utils';
import { FiMessageCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Link from 'next/link';

interface QuestionCardProps {
  question: Question;
  showAnswerLink?: boolean;
  businessId?: string;
}

export default function QuestionCard({ question, showAnswerLink = true, businessId }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const answers = question.answers || [];

  return (
    <div className="card p-4">
      {/* Question */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {getInitials(question.asker?.full_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 leading-snug">{question.question_text}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400">
              {question.asker?.full_name || 'Anonymous'} · {timeAgo(question.created_at)}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <FiMessageCircle />
              {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
              {expanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
        </div>
        {showAnswerLink && (
          <Link
            href={`/questions/${question.id}/answer`}
            className="text-xs btn-ghost py-1 px-2 flex-shrink-0"
          >
            Answer
          </Link>
        )}
      </div>

      {/* Answers (expanded) */}
      {expanded && answers.length > 0 && (
        <div className="mt-3 ml-11 space-y-3">
          {answers.map((answer) => (
            <AnswerItem key={answer.id} answer={answer} />
          ))}
        </div>
      )}

      {expanded && answers.length === 0 && (
        <p className="mt-3 ml-11 text-sm text-gray-400 italic">No answers yet. Be the first!</p>
      )}
    </div>
  );
}

function AnswerItem({ answer }: { answer: Answer }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-sm text-gray-800 leading-relaxed">{answer.answer_text}</p>
      {answer.recommended_business && (
        <Link
          href={`/businesses/${answer.recommended_business.id}`}
          className="inline-flex items-center gap-1 mt-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium"
        >
          🍽️ Recommends: {answer.recommended_business.name}
        </Link>
      )}
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-xs text-gray-400">
          {answer.answerer?.full_name || 'Anonymous'} · {timeAgo(answer.created_at)}
        </span>
        <span className="text-xs text-gray-400">👍 {answer.upvotes}</span>
      </div>
    </div>
  );
}
