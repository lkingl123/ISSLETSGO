import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ScrollView, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerWeb from 'react-datetime-picker';
import { UserContext } from '../UserContext';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '648062377559-6fge85fbh1hbi6ja7j9qcpjarj9cjr4h.apps.googleusercontent.com';

function HomeScreen() {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: new Date(), end: new Date() });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
  });

  useEffect(() => {
    const checkStoredToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const expiry = await AsyncStorage.getItem('tokenExpiry');
      if (token && expiry && new Date().getTime() < parseInt(expiry, 10)) {
        setAccessToken(token);
        fetchEvents(token);
      }
    };
    checkStoredToken();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      const expiryTime = new Date().getTime() + 3600 * 1000; // 1 hour
      AsyncStorage.setItem('accessToken', authentication.accessToken);
      AsyncStorage.setItem('tokenExpiry', expiryTime.toString());
      setAccessToken(authentication.accessToken);
      fetchEvents(authentication.accessToken);
    }
  }, [response]);

  const fetchEvents = async (token) => {
    const today = new Date();
    const oneYearAgo = new Date();
    const oneYearAhead = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAhead.setFullYear(today.getFullYear() + 1);

    try {
      const result = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${oneYearAgo.toISOString()}&timeMax=${oneYearAhead.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!result.ok) {
        throw new Error(`Error fetching events: ${result.statusText}`);
      }
      const data = await result.json();
      if (data.items) {
        const formattedEvents = data.items.map((event) => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
        }));
        setEvents(formattedEvents);
      } else {
        throw new Error('No events found');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const addEventToCalendar = async (token) => {
    const event = {
      summary: newEvent.title,
      start: {
        dateTime: newEvent.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: newEvent.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      if (!response.ok) {
        throw new Error(`Error adding event: ${response.statusText}`);
      }
      const result = await response.json();
      setEvents([...events, { id: result.id, title: result.summary, start: result.start.dateTime, end: result.end.dateTime }]);
      Alert.alert('Event added', `Event "${result.summary}" added to your calendar`);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const removeEventFromCalendar = async (eventId) => {
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error removing event: ${response.statusText}`);
      }
      setEvents(events.filter(event => event.id !== eventId));
      Alert.alert('Event removed', 'The event has been removed from your calendar');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const eventsForSelectedDate = events.filter(event => event.start.split('T')[0] === selectedDate);

  const markedDates = events.reduce((acc, event) => {
    const eventDate = event.start.split('T')[0];
    const isFutureEvent = new Date(event.start) > new Date();
    acc[eventDate] = { marked: true, dotColor: isFutureEvent ? 'green' : 'red' };
    return acc;
  }, {});

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('tokenExpiry');
    setAccessToken(null);
  };

  useEffect(() => {
    const timer = setTimeout(handleLogout, 3600 * 1000); // 1 hour
    return () => clearTimeout(timer);
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setEventModalVisible(true);
  };

  const handleDateChange = (event, selectedDate, type) => {
    const currentDate = selectedDate || newEvent[type];
    setShowStartPicker(false);
    setShowEndPicker(false);
    setNewEvent({ ...newEvent, [type]: currentDate });
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.fixedHeader}>
            {!accessToken && <Button
      title="Sync to Google Calendar"
      onPress={() => promptAsync()}
      disabled={!request}
      color="#00AEEF" // Using the color you expect
    />}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>My Appointments</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                  <Image source={require('../assets/add3.svg')} style={styles.addButtonImage} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout}>
                  <Image source={require('../assets/logout2.svg')} style={styles.logoutButtonImage} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.calendarContainerWrapper}>
              <View style={styles.calendarContainer}>
                <Calendar
                  current={new Date().toISOString().split('T')[0]}
                  minDate={'2022-01-01'}
                  maxDate={'2024-12-31'}
                  markedDates={markedDates}
                  onDayPress={handleDayPress}
                  onMonthChange={() => {
                    setSelectedDate('');
                  }}
                  theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#2e2e2e',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: '#673ab7',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#ff5722',
                    dayTextColor: '#ffffff',
                    textDisabledColor: '#f0f0f0',
                    dotColor: '#ffffff', 
                    selectedDotColor: '#ffffff',
                    arrowColor: '#ff5722',
                    monthTextColor: '#ffffff',
                    indicatorColor: '#ffffff',
                    textDayFontFamily: 'monospace',
                    textMonthFontFamily: 'monospace',
                    textDayHeaderFontFamily: 'monospace',
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16,
                  }}
                  
                />
              </View>
            </View>
          </ScrollView>
          <Modal isVisible={eventModalVisible} onBackdropPress={() => setEventModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.dateTitle}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
            {eventsForSelectedDate.length > 0 ? (
              eventsForSelectedDate.map((event, index) => {
                const startTime = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                const endTime = new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                return (
                  <View key={index} style={styles.eventItem}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTimes}>{`${startTime} - ${endTime}`}</Text>
                    <TouchableOpacity onPress={() => removeEventFromCalendar(event.id)}>
                      <Image source={require('../assets/remove.svg')} style={styles.removeButtonImage} />
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noEventsText}>No events for this date</Text>
            )}
          </View>
        </Modal>
          <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              />
              <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                <Text style={styles.dateText}>Start: {newEvent.start.toLocaleString()}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                Platform.OS === 'web' ? (
                  <DateTimePickerWeb
                    onChange={(date) => handleDateChange(null, date, 'start')}
                    value={newEvent.start}
                    disableClock={true}
                    clearIcon={null}
                    calendarIcon={null}
                  />
                ) : (
                  <DateTimePicker
                    value={newEvent.start}
                    mode="time"
                    display="spinner"
                    onChange={(event, date) => handleDateChange(event, date, 'start')}
                  />
                )
              )}
              <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                <Text style={styles.dateText}>End: {newEvent.end.toLocaleString()}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                Platform.OS === 'web' ? (
                  <DateTimePickerWeb
                    onChange={(date) => handleDateChange(null, date, 'end')}
                    value={newEvent.end}
                    disableClock={true}
                    clearIcon={null}
                    calendarIcon={null}
                  />
                ) : (
                  <DateTimePicker
                    value={newEvent.end}
                    mode="time"
                    display="spinner"
                    onChange={(event, date) => handleDateChange(event, date, 'end')}
                  />
                )
              )}
              <Button title="Add Event" onPress={() => addEventToCalendar(accessToken)} />
            </View>
          </Modal>
        </>
      ) : (
        <Text style={styles.noUserText}>No user information</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  fixedHeader: {
    backgroundColor: '#2e2e2e', // Slightly lighter background color
    zIndex: 1,
    width: '100%',
    borderRadius:10, // top header side border radius
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    padding: 8,
    textAlign: 'center',
    color: '#ffffff',
  },
  noUserText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 5,
    backgroundColor: '#2e2e2e', // Slightly lighter background color
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00AEEF',
    alignItems: 'center',
    marginLeft:70,
  },
  calendarContainerWrapper: {
    width: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius:10, // Curved corners
    overflow: 'hidden', // Ensures children are clipped to the container's bounds
    marginTop:-20,
  },
  calendarContainer: {
    backgroundColor: '#333333', // Slightly lighter background color
  },
  eventListContainer: {
    marginTop: 10,
    width: '100%',
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ffffff',
  },
  eventItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#3e3e3e',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  eventDates: {
    fontSize: 14,
    color: '#ffffff',
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
  eventTimes: {
    fontSize: 14,
    color: '#ffffff',
  },  
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#3e3e3e',
  },
  selectDateText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
  addButton: {
    padding: 10,
  },
  addButtonImage: {
    width: 30,
    height: 30,
    backgroundColor: '#2e2e2e',
    padding: 10,
    borderRadius: 5,
  },
  removeButtonImage: {
    width: 20,
    height: 20,
    // Add your own style or leave it for the SVG path
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    padding: 5,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#673ab7',
  },
  logoutButtonImage: {
    width: 30,
    height: 30,
    backgroundColor: '#2e2e2e',
    padding: 10,
    borderRadius: 5,
  },
});

export default HomeScreen;
