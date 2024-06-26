import { DomainEvents } from '../../../../core/events/domain-events'
import { EventHandler } from '../../../../core/events/event-handler'
import { AnswersRepository } from '../../../forum/application/repositories/answers-repository'
import { QuestionBestAnswerChosenEvent } from '../../../forum/enterprise/entities/events/question-best-answer-chosen-event'
import { SendNotificationUseCase } from '../use-cases/send-notification'

export class OnQuestionBestAnswerChosen implements EventHandler {
  constructor(
    private answersRepository: AnswersRepository,
    private sendNotificaction: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendQuestionBestAnswerNotification.bind(this),
      QuestionBestAnswerChosenEvent.name,
    )
  }

  private async sendQuestionBestAnswerNotification({
    question,
    bestAnswerId,
  }: QuestionBestAnswerChosenEvent) {
    const answer = await this.answersRepository.findById(
      bestAnswerId?.toString(),
    )

    if (answer) {
      await this.sendNotificaction.execute({
        recipiendId: answer.authorId.toString(),
        title: 'Sua resposta foi escolhida',
        content: `A resposta que você enviou em ${question.title.substring(0, 20).concat('...')} foi escolhida pelo autor.`,
      })
    }
  }
}
