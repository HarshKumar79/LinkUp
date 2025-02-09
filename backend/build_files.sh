echo "Installing dependencies..."
pip install -r backend/requirements.txt

echo "Applying migrations..."
python backend/manage.py migrate --noinput

echo "Collecting static files..."
python backend/manage.py collectstatic --noinput --clear

echo "Build completed successfully."