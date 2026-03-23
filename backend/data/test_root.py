from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

class RootURLTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_root_url_status(self):
        """
        Test that the root URL returns 200 OK.
        """
        response = self.client.get('/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], 'InvestoMart API')

    def test_favicon_url_status(self):
        """
        Test that the favicon URL returns 204 No Content.
        """
        response = self.client.get('/favicon.ico')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
