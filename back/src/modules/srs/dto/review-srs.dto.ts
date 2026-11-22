import { IsIn } from 'class-validator';
import { SrsRating } from '../../../entities/srs-review.entity';

export class ReviewSrsDto {
  @IsIn(['again', 'hard', 'good', 'easy'])
  rating: SrsRating;
}
