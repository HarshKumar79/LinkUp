echo "Installing dependencies..."
pip install -r backend/requirements.txt

echo "Applying migrations..."
python backend/manage.py migrate --noinput

echo "Build completed successfully."
