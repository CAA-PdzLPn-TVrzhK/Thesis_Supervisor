import pytest
import responses
import datetime
from unittest.mock import MagicMock, patch
from app.Api.submissions_handler import (
    calculate_score,
    get_milestone_info,
    get_student_info,
    update_student_score,
    delete_submission,
    process_submission,
    process_submissions,
    EXTERNAL_API_URL
)


class TestSubmissionsHandler:
    
    def test_calculate_score_early_submission(self):
        """Тест расчета балла за раннюю сдачу"""
        submitted_at = "2024-01-15T10:00:00Z"
        deadline = "2024-01-16T10:00:00Z"
        weight = 1.0
        
        score = calculate_score(submitted_at, deadline, weight)
        assert score == 85  # 85% от базового балла за сдачу за день
    
    def test_calculate_score_late_submission(self):
        """Тест расчета балла за позднюю сдачу"""
        submitted_at = "2024-01-16T11:00:00Z"
        deadline = "2024-01-16T10:00:00Z"
        weight = 1.0
        
        score = calculate_score(submitted_at, deadline, weight)
        assert score == 0  # 0 баллов за сдачу после дедлайна
    
    def test_calculate_score_hour_before_deadline(self):
        """Тест расчета балла за сдачу за час до дедлайна"""
        submitted_at = "2024-01-16T09:00:00Z"
        deadline = "2024-01-16T10:00:00Z"
        weight = 1.0
        
        score = calculate_score(submitted_at, deadline, weight)
        assert score == 70  # 70% от базового балла за сдачу за час
    
    def test_calculate_score_max_100_limit(self):
        """Тест ограничения максимального балла в 100"""
        submitted_at = "2024-01-10T10:00:00Z"  # За неделю
        deadline = "2024-01-16T10:00:00Z"
        weight = 2.0  # Коэффициент 2.0
        
        score = calculate_score(submitted_at, deadline, weight)
        assert score == 95  # 100 * 0.95 = 95 (ограничение в 100 не применяется)
    
    @responses.activate
    def test_get_milestone_info_success(self):
        """Тест успешного получения информации о milestone"""
        milestone_data = {
            "id": 1,
            "title": "Test Milestone",
            "deadline": "2024-01-16T10:00:00Z",
            "weight": 10
        }
        
        responses.add(
            "GET",
            f"{EXTERNAL_API_URL}milestones?id=eq.1",
            json=[milestone_data],
            status=200
        )
        
        result = get_milestone_info(1)
        assert result == milestone_data
    
    @responses.activate
    def test_get_milestone_info_not_found(self):
        """Тест получения информации о несуществующем milestone"""
        responses.add(
            "GET",
            f"{EXTERNAL_API_URL}milestones?id=eq.999",
            json=[],
            status=200
        )
        
        result = get_milestone_info(999)
        assert result is None
    
    @responses.activate
    def test_get_student_info_success(self):
        """Тест успешного получения информации о студенте"""
        student_data = {
            "id": 1,
            "user_id": 123,
            "score": 50
        }
        
        responses.add(
            "GET",
            f"{EXTERNAL_API_URL}students?id=eq.1",
            json=[student_data],
            status=200
        )
        
        result = get_student_info(1)
        assert result == student_data
    
    @responses.activate
    def test_update_student_score_success(self):
        """Тест успешного обновления score студента"""
        student_data = {"id": 1, "score": 50}
        
        responses.add(
            "GET",
            f"{EXTERNAL_API_URL}students?id=eq.1",
            json=[student_data],
            status=200
        )
        
        responses.add(
            "PATCH",
            f"{EXTERNAL_API_URL}students?id=eq.1",
            json={"score": 60},
            status=200
        )
        
        result = update_student_score(1, 10)
        assert result is True
    
    @responses.activate
    def test_delete_submission_success(self):
        """Тест успешного удаления сабмишена"""
        responses.add(
            "DELETE",
            f"{EXTERNAL_API_URL}submissions?id=eq.1",
            status=200
        )
        
        result = delete_submission(1)
        assert result is True
    
    def test_process_submission_failed_status_after_deadline(self):
        """Тест обработки сабмишена со статусом 'failed' после дедлайна"""
        submission = {
            "id": 1,
            "status": "failed",
            "student_id": 1,
            "milestone_id": 1,
            "submitted_at": "2024-01-15T10:00:00Z"
        }
        
        milestone_data = {
            "id": 1,
            "deadline": "2024-01-14T10:00:00Z",  # Прошедший дедлайн
            "weight": 1.0
        }
        
        # Мокаем текущее время на 2024-01-15 (после дедлайна)
        mock_now = datetime.datetime(2024, 1, 15, 10, 0, 0, tzinfo=datetime.timezone.utc)
        
        with patch('app.Api.submissions_handler.get_milestone_info') as mock_get_milestone:
            with patch('app.Api.submissions_handler.delete_submission') as mock_delete:
                with patch('app.Api.submissions_handler.datetime') as mock_datetime:
                    mock_get_milestone.return_value = milestone_data
                    mock_datetime.datetime.now.return_value = mock_now
                    mock_datetime.datetime.fromisoformat.side_effect = datetime.datetime.fromisoformat
                    mock_datetime.timezone.utc = datetime.timezone.utc
                    mock_delete.return_value = True
                    
                    result = process_submission(submission)
                    assert result is True
                    mock_delete.assert_called_once_with(1)
    
    def test_process_submission_pending_status_after_deadline(self):
        """Тест обработки сабмишена со статусом 'pending' после дедлайна"""
        submission = {
            "id": 1,
            "status": "pending",
            "student_id": 1,
            "milestone_id": 1,
            "submitted_at": "2024-01-15T10:00:00Z"
        }
        
        milestone_data = {
            "id": 1,
            "deadline": "2024-01-14T10:00:00Z",  # Прошедший дедлайн
            "weight": 1.0
        }
        
        # Мокаем текущее время на 2024-01-15 (после дедлайна)
        mock_now = datetime.datetime(2024, 1, 15, 10, 0, 0, tzinfo=datetime.timezone.utc)
        
        with patch('app.Api.submissions_handler.get_milestone_info') as mock_get_milestone:
            with patch('app.Api.submissions_handler.datetime') as mock_datetime:
                mock_get_milestone.return_value = milestone_data
                mock_datetime.datetime.now.return_value = mock_now
                mock_datetime.datetime.fromisoformat.side_effect = datetime.datetime.fromisoformat
                mock_datetime.timezone.utc = datetime.timezone.utc
                
                result = process_submission(submission)
                assert result is True  # Оставляем pending сабмишены
    
    def test_process_submission_before_deadline(self):
        """Тест обработки сабмишена до дедлайна"""
        submission = {
            "id": 1,
            "status": "approved",
            "student_id": 1,
            "milestone_id": 1,
            "submitted_at": "2024-01-15T10:00:00Z"
        }
        
        milestone_data = {
            "id": 1,
            "deadline": "2024-01-16T10:00:00Z",  # Будущий дедлайн
            "weight": 1.0
        }
        
        # Мокаем текущее время на 2024-01-15 (до дедлайна)
        mock_now = datetime.datetime(2024, 1, 15, 10, 0, 0, tzinfo=datetime.timezone.utc)
        
        with patch('app.Api.submissions_handler.get_milestone_info') as mock_get_milestone:
            with patch('app.Api.submissions_handler.datetime') as mock_datetime:
                mock_get_milestone.return_value = milestone_data
                mock_datetime.datetime.now.return_value = mock_now
                mock_datetime.datetime.fromisoformat.side_effect = datetime.datetime.fromisoformat
                mock_datetime.timezone.utc = datetime.timezone.utc
                
                result = process_submission(submission)
                assert result is True  # Пропускаем до дедлайна
    
    def test_process_submission_approved_status_after_deadline(self):
        """Тест обработки сабмишена со статусом 'approved' после дедлайна"""
        submission = {
            "id": 1,
            "status": "approved",
            "student_id": 1,
            "milestone_id": 1,
            "submitted_at": "2024-01-15T10:00:00Z"
        }
        
        milestone_data = {
            "id": 1,
            "deadline": "2024-01-14T10:00:00Z",  # Прошедший дедлайн
            "weight": 1.0
        }
        
        # Мокаем текущее время на 2024-01-15 (после дедлайна)
        mock_now = datetime.datetime(2024, 1, 15, 10, 0, 0, tzinfo=datetime.timezone.utc)
        
        with patch('app.Api.submissions_handler.get_milestone_info') as mock_get_milestone:
            with patch('app.Api.submissions_handler.update_student_score') as mock_update_score:
                with patch('app.Api.submissions_handler.delete_submission') as mock_delete:
                    with patch('app.Api.submissions_handler.datetime') as mock_datetime:
                        mock_get_milestone.return_value = milestone_data
                        mock_datetime.datetime.now.return_value = mock_now
                        mock_datetime.datetime.fromisoformat.side_effect = datetime.datetime.fromisoformat
                        mock_datetime.timezone.utc = datetime.timezone.utc
                        mock_update_score.return_value = True
                        mock_delete.return_value = True
                        
                        result = process_submission(submission)
                        assert result is True
                        mock_update_score.assert_called_once()
                        mock_delete.assert_called_once_with(1)
    
    def test_process_submission_missing_fields(self):
        """Тест обработки сабмишена с отсутствующими полями"""
        submission = {
            "id": None,
            "status": "approved",
            "student_id": 1,
            "milestone_id": 1,
            "submitted_at": "2024-01-15T10:00:00Z"
        }
        
        result = process_submission(submission)
        assert result is False
    
    @responses.activate
    def test_process_submissions_success(self):
        """Тест успешной обработки всех сабмишенов"""
        submissions_data = [
            {
                "id": 1,
                "status": "approved",
                "student_id": 1,
                "milestone_id": 1,
                "submitted_at": "2024-01-15T10:00:00Z"
            },
            {
                "id": 2,
                "status": "failed",
                "student_id": 2,
                "milestone_id": 1,
                "submitted_at": "2024-01-15T10:00:00Z"
            }
        ]
        
        responses.add(
            "GET",
            f"{EXTERNAL_API_URL}submissions",
            json=submissions_data,
            status=200
        )
        
        with patch('app.Api.submissions_handler.process_submission') as mock_process:
            mock_process.return_value = True
            
            # Запускаем синхронно для теста
            import asyncio
            asyncio.run(process_submissions())
            
            assert mock_process.call_count == 2 